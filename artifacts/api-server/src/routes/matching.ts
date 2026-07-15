import { Router, type IRouter } from "express";
import { eq, and, or, ne, gt, sql } from "drizzle-orm";
import {
  db,
  matchRequestsTable,
  chatSessionsTable,
  userBlocksTable,
} from "@workspace/db";
import {
  CreateMatchRequestBody,
  CreateMatchRequestResponse,
  GetMatchRequestParams,
  GetMatchRequestResponse,
  CancelMatchRequestParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
router.use(requireAuth);

const MATCH_WINDOW_MS = 10 * 60 * 1000;

// Duration buckets: sessions are compatible if they're in the same bucket.
// This prevents a 15-min user from being silently matched with a 60-min user.
const DURATION_BUCKETS = [
  [15, 30],   // short
  [45, 60],   // long
];

function sameDurationBucket(a: number, b: number): boolean {
  for (const bucket of DURATION_BUCKETS) {
    if (bucket.includes(a) && bucket.includes(b)) return true;
  }
  return a === b; // exact match always passes
}

function isCompatible(
  request: { skillLevel: string; durationMinutes: number },
  candidate: { skillLevel: string; durationMinutes: number },
) {
  const skillOk =
    candidate.skillLevel === "any" || request.skillLevel === "any"
      ? true
      : candidate.skillLevel === request.skillLevel;
  const durationOk = sameDurationBucket(request.durationMinutes, candidate.durationMinutes);
  return skillOk && durationOk;
}

/** Attempts to pair `request` with a compatible waiting request from a different user. */
async function tryMatch(request: {
  id: number;
  userId: number;
  topic: string;
  skillLevel: string;
  chatType: string;
  durationMinutes: number;
}) {
  return await db.transaction(async (tx) => {
    const blocks = await tx
      .select()
      .from(userBlocksTable)
      .where(
        or(eq(userBlocksTable.blockerId, request.userId), eq(userBlocksTable.blockedId, request.userId)),
      );
    const blockedUserIds = new Set(
      blocks.map((b) => (b.blockerId === request.userId ? b.blockedId : b.blockerId)),
    );

    const cutoff = new Date(Date.now() - MATCH_WINDOW_MS);

    const preferredCandidates = await tx
      .select()
      .from(matchRequestsTable)
      .where(
        and(
          eq(matchRequestsTable.status, "waiting"),
          eq(matchRequestsTable.topic, request.topic),
          eq(matchRequestsTable.chatType, request.chatType),
          ne(matchRequestsTable.userId, request.userId),
          gt(matchRequestsTable.createdAt, cutoff),
        ),
      )
      .orderBy(matchRequestsTable.createdAt);

    const partner = preferredCandidates.find((candidate) => {
      if (blockedUserIds.has(candidate.userId)) return false;
      return isCompatible(request, candidate);
    });

    let fallbackPartner = null;
    if (!partner) {
      // Fallback: same chatType but any topic. Never cross chat modes.
      const fallbackCandidates = await tx
        .select()
        .from(matchRequestsTable)
        .where(
          and(
            eq(matchRequestsTable.status, "waiting"),
            eq(matchRequestsTable.chatType, request.chatType),
            ne(matchRequestsTable.userId, request.userId),
            gt(matchRequestsTable.createdAt, cutoff),
          ),
        )
        .orderBy(sql`random()`);

      fallbackPartner = fallbackCandidates.find((candidate) => {
        if (blockedUserIds.has(candidate.userId)) return false;
        return isCompatible(request, candidate);
      });
    }

    const selectedPartner = partner ?? fallbackPartner;
    if (!selectedPartner) return null;

    // Re-fetch partner row for-update-style inside the transaction to reduce races.
    const [freshPartner] = await tx
      .select()
      .from(matchRequestsTable)
      .where(and(eq(matchRequestsTable.id, selectedPartner.id), eq(matchRequestsTable.status, "waiting")));
    if (!freshPartner) return null;

    const [session] = await tx
      .insert(chatSessionsTable)
      .values({
        userAId: request.userId,
        userBId: selectedPartner.userId,
        topic: request.topic,
        chatType: request.chatType as "text" | "voice",
        durationMinutes: request.durationMinutes,
        status: "active",
      })
      .returning();

    await tx
      .update(matchRequestsTable)
      .set({ status: "matched", sessionId: session.id })
      .where(eq(matchRequestsTable.id, selectedPartner.id));

    const [updatedSelf] = await tx
      .update(matchRequestsTable)
      .set({ status: "matched", sessionId: session.id })
      .where(eq(matchRequestsTable.id, request.id))
      .returning();

    return updatedSelf;
  });
}

router.post("/discuss/match", async (req, res): Promise<void> => {
  const parsed = CreateMatchRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const [created] = await db
    .insert(matchRequestsTable)
    .values({
      userId,
      topic: parsed.data.topic,
      skillLevel: parsed.data.skillLevel,
      chatType: parsed.data.chatType,
      durationMinutes: parsed.data.durationMinutes,
      language: parsed.data.language,
    })
    .returning();

  const matched = await tryMatch(created);

  res.status(201).json(CreateMatchRequestResponse.parse(matched ?? created));
});

router.get("/discuss/match/:id", async (req, res): Promise<void> => {
  const params = GetMatchRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const [request] = await db
    .select()
    .from(matchRequestsTable)
    .where(and(eq(matchRequestsTable.id, params.data.id), eq(matchRequestsTable.userId, userId)));
  if (!request) {
    res.status(404).json({ error: "Match request not found" });
    return;
  }

  if (request.status === "waiting") {
    // Auto-expire requests older than the match window so the client
    // gets an "expired" status instead of spinning forever.
    const cutoff = new Date(Date.now() - MATCH_WINDOW_MS);
    if (request.createdAt < cutoff) {
      const [expired] = await db
        .update(matchRequestsTable)
        .set({ status: "expired" })
        .where(eq(matchRequestsTable.id, request.id))
        .returning();
      res.json(GetMatchRequestResponse.parse(expired ?? request));
      return;
    }

    const matched = await tryMatch(request);
    res.json(GetMatchRequestResponse.parse(matched ?? request));
    return;
  }

  res.json(GetMatchRequestResponse.parse(request));
});

router.delete("/discuss/match/:id", async (req, res): Promise<void> => {
  const params = CancelMatchRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const [cancelled] = await db
    .update(matchRequestsTable)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(matchRequestsTable.id, params.data.id),
        eq(matchRequestsTable.userId, userId),
        eq(matchRequestsTable.status, "waiting"),
      ),
    )
    .returning();

  if (!cancelled) {
    res.status(404).json({ error: "Match request not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
