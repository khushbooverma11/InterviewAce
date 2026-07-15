import { Router, type IRouter } from "express";
import { eq, and, or, asc } from "drizzle-orm";
import {
  db,
  chatSessionsTable,
  chatMessagesTable,
  sessionReportsTable,
  userBlocksTable,
  usersTable,
} from "@workspace/db";
import {
  ListChatSessionsResponse,
  GetChatSessionParams,
  GetChatSessionResponse,
  ListSessionMessagesParams,
  ListSessionMessagesResponse,
  SendSessionMessageParams,
  SendSessionMessageBody,
  SendSessionMessageResponse,
  EndChatSessionParams,
  EndChatSessionResponse,
  ReportChatSessionParams,
  ReportChatSessionBody,
  ReportChatSessionResponse,
  BlockSessionPartnerParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { checkAndGrantAchievements } from "../lib/gamification";

const router: IRouter = Router();
router.use(requireAuth);

async function loadSessionForUser(sessionId: number, userId: number) {
  const [session] = await db
    .select()
    .from(chatSessionsTable)
    .where(
      and(
        eq(chatSessionsTable.id, sessionId),
        or(eq(chatSessionsTable.userAId, userId), eq(chatSessionsTable.userBId, userId)),
      ),
    );
  return session ?? null;
}

async function serializeSession(session: typeof chatSessionsTable.$inferSelect, viewerId: number) {
  const partnerId = session.userAId === viewerId ? session.userBId : session.userAId;
  const [partner] = await db.select().from(usersTable).where(eq(usersTable.id, partnerId));
  return {
    id: session.id,
    topic: session.topic,
    chatType: session.chatType,
    durationMinutes: session.durationMinutes,
    status: session.status,
    partnerHandle: partner?.anonymousHandle ?? "Unknown",
    partnerAvatarColor: partner?.avatarColor ?? "#7c6cff",
    startedAt: session.startedAt,
    endedAt: session.endedAt,
  };
}

router.get("/discuss/sessions", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const sessions = await db
    .select()
    .from(chatSessionsTable)
    .where(or(eq(chatSessionsTable.userAId, userId), eq(chatSessionsTable.userBId, userId)))
    .orderBy(asc(chatSessionsTable.startedAt));

  const serialized = await Promise.all(sessions.map((s) => serializeSession(s, userId)));
  res.json(ListChatSessionsResponse.parse(serialized));
});

router.get("/discuss/sessions/:id", async (req, res): Promise<void> => {
  const params = GetChatSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(GetChatSessionResponse.parse(await serializeSession(session, userId)));
});

router.get("/discuss/sessions/:id/messages", async (req, res): Promise<void> => {
  const params = ListSessionMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.sessionId, params.data.id))
    .orderBy(asc(chatMessagesTable.createdAt));

  res.json(
    ListSessionMessagesResponse.parse(
      messages.map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        isMine: m.senderId === userId,
        type: m.type,
        content: m.content,
        createdAt: m.createdAt,
      })),
    ),
  );
});

router.post("/discuss/sessions/:id/messages", async (req, res): Promise<void> => {
  const params = SendSessionMessageParams.safeParse(req.params);
  const body = SendSessionMessageBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)!.message });
    return;
  }
  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (session.status !== "active") {
    res.status(400).json({ error: "Session has ended" });
    return;
  }

  const [message] = await db
    .insert(chatMessagesTable)
    .values({ sessionId: params.data.id, senderId: userId, type: body.data.type, content: body.data.content })
    .returning();

  res.status(201).json(
    SendSessionMessageResponse.parse({
      id: message.id,
      sessionId: message.sessionId,
      isMine: true,
      type: message.type,
      content: message.content,
      createdAt: message.createdAt,
    }),
  );
});

router.post("/discuss/sessions/:id/end", async (req, res): Promise<void> => {
  const params = EndChatSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const wasActive = session.status === "active";
  const [updated] = await db
    .update(chatSessionsTable)
    .set({ status: "ended", endedAt: session.endedAt ?? new Date() })
    .where(eq(chatSessionsTable.id, params.data.id))
    .returning();

  if (wasActive) {
    await db.insert(chatMessagesTable).values({
      sessionId: params.data.id,
      senderId: userId,
      type: "system",
      content: "Session ended.",
    });
    await checkAndGrantAchievements(userId, "session_completed");
  }

  res.json(EndChatSessionResponse.parse(await serializeSession(updated, userId)));
});

router.post("/discuss/sessions/:id/report", async (req, res): Promise<void> => {
  const params = ReportChatSessionParams.safeParse(req.params);
  const body = ReportChatSessionBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)!.message });
    return;
  }
  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const reportedUserId = session.userAId === userId ? session.userBId : session.userAId;

  const [report] = await db
    .insert(sessionReportsTable)
    .values({
      sessionId: params.data.id,
      reporterId: userId,
      reportedUserId,
      reason: body.data.reason,
      details: body.data.details,
    })
    .returning();

  res.status(201).json(
    ReportChatSessionResponse.parse({
      id: report.id,
      sessionId: report.sessionId,
      reason: report.reason,
      createdAt: report.createdAt,
    }),
  );
});

router.post("/discuss/sessions/:id/block", async (req, res): Promise<void> => {
  const params = BlockSessionPartnerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const partnerId = session.userAId === userId ? session.userBId : session.userAId;

  await db
    .insert(userBlocksTable)
    .values({ blockerId: userId, blockedId: partnerId })
    .onConflictDoNothing();

  res.sendStatus(204);
});

export default router;
