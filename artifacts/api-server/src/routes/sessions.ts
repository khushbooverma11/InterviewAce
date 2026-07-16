import { Router, type IRouter } from "express";
import { eq, and, or, asc } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  chatSessionsTable,
  chatMessagesTable,
  sessionReportsTable,
  userBlocksTable,
  usersTable,
  webrtcSignalsTable,
  sessionFeedbackTable,
  notificationsTable,
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
import { issueWsTicket } from "../ws-tickets";

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
    // isCaller: userA always initiates the WebRTC offer
    isCaller: session.userAId === viewerId,
    // partnerId needed for signaling recipient routing
    partnerId,
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
  res.json(await serializeSession(session, userId));
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

  res.json(await serializeSession(updated, userId));
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

router.post("/discuss/sessions/:id/rate", async (req, res): Promise<void> => {
  const params = GetChatSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = z
    .object({
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().max(160).optional(),
    })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const reportedUserId = session.userAId === userId ? session.userBId : session.userAId;
  const details = body.data.comment
    ? `rating:${body.data.rating}; comment:${body.data.comment}`
    : `rating:${body.data.rating}`;

  await db.insert(sessionReportsTable).values({
    sessionId: params.data.id,
    reporterId: userId,
    reportedUserId,
    reason: "other",
    details,
  });

  res.status(201).json({ ok: true, rating: body.data.rating });
});

// ---------------------------------------------------------------------------
// WebRTC Signaling
// ---------------------------------------------------------------------------

/**
 * POST /discuss/sessions/:id/signal
 * Store a signal record (offer / answer / ice-candidate / hangup) for the partner.
 */
router.post("/discuss/sessions/:id/signal", async (req, res): Promise<void> => {
  const params = GetChatSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { type, payload } = req.body as { type?: string; payload?: string };
  const VALID_TYPES = ["offer", "answer", "ice-candidate", "hangup"];
  if (!type || !VALID_TYPES.includes(type) || typeof payload !== "string") {
    res.status(400).json({ error: "type and payload are required" });
    return;
  }
  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const recipientId = session.userAId === userId ? session.userBId : session.userAId;

  await db.insert(webrtcSignalsTable).values({
    sessionId: params.data.id,
    senderId: userId,
    recipientId,
    type,
    payload,
  });

  res.status(201).json({ ok: true });
});

/**
 * GET /discuss/sessions/:id/signals
 * Return all unconsumed signals sent to the current user, then mark them consumed.
 */
router.get("/discuss/sessions/:id/signals", async (req, res): Promise<void> => {
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

  const signals = await db
    .select()
    .from(webrtcSignalsTable)
    .where(
      and(
        eq(webrtcSignalsTable.sessionId, params.data.id),
        eq(webrtcSignalsTable.recipientId, userId),
        eq(webrtcSignalsTable.consumed, false),
      ),
    )
    .orderBy(asc(webrtcSignalsTable.createdAt));

  if (signals.length > 0) {
    const ids = signals.map((s) => s.id);
    // Mark all consumed in one update (drizzle doesn't support WHERE IN directly, use a loop)
    await Promise.all(
      ids.map((id) =>
        db
          .update(webrtcSignalsTable)
          .set({ consumed: true })
          .where(eq(webrtcSignalsTable.id, id)),
      ),
    );
  }

  res.json(signals.map((s) => ({ id: s.id, type: s.type, payload: s.payload })));
});

/**
 * GET /discuss/sessions/:id/ws-ticket
 * Issues a one-time ticket (30 s TTL) to open a WebSocket signaling connection.
 */
router.get("/discuss/sessions/:id/ws-ticket", async (req, res): Promise<void> => {
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
  const ticket = issueWsTicket(userId, params.data.id);
  res.json({ ticket });
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

// ---------------------------------------------------------------------------
// Enhanced Session Feedback
// POST /discuss/sessions/:id/feedback
// ---------------------------------------------------------------------------
router.post("/discuss/sessions/:id/feedback", async (req, res): Promise<void> => {
  const params = GetChatSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = z
    .object({
      overallRating: z.number().int().min(1).max(5),
      communication: z.number().int().min(1).max(5).optional(),
      helpfulness: z.number().int().min(1).max(5).optional(),
      knowledge: z.number().int().min(1).max(5).optional(),
      comments: z.string().trim().max(500).optional(),
    })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const userId = req.appUser!.id;
  const session = await loadSessionForUser(params.data.id, userId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (session.status !== "ended") {
    res.status(409).json({ error: "Session must be ended before submitting feedback" });
    return;
  }

  const rateeId = session.userAId === userId ? session.userBId : session.userAId;

  const [feedback] = await db
    .insert(sessionFeedbackTable)
    .values({
      sessionId: params.data.id,
      raterId: userId,
      rateeId,
      overallRating: body.data.overallRating,
      communication: body.data.communication ?? null,
      helpfulness: body.data.helpfulness ?? null,
      knowledge: body.data.knowledge ?? null,
      comments: body.data.comments ?? null,
    })
    .onConflictDoNothing()
    .returning();

  // Notify the ratee
  if (feedback) {
    await db.insert(notificationsTable).values({
      userId: rateeId,
      type: "feedback_received",
      fromUserId: userId,
      refId: feedback.id,
      refType: "session_feedback",
    });

    const { sendToUser } = await import("../ws-server");
    const [rater] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    sendToUser(rateeId, {
      type: "notification",
      notification: {
        type: "feedback_received",
        fromHandle: rater?.anonymousHandle ?? "Someone",
        fromAvatarColor: rater?.avatarColor ?? "#7c6cff",
        fromUserId: userId,
      },
    });
  }

  res.status(201).json({ ok: true });
});

// ---------------------------------------------------------------------------
// GET /discuss/sessions/:id/feedback — fetch feedback for a session
// ---------------------------------------------------------------------------
router.get("/discuss/sessions/:id/feedback", async (req, res): Promise<void> => {
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

  // Return the feedback this user gave (if any)
  const [feedback] = await db
    .select()
    .from(sessionFeedbackTable)
    .where(
      and(
        eq(sessionFeedbackTable.sessionId, params.data.id),
        eq(sessionFeedbackTable.raterId, userId),
      ),
    );

  res.json(feedback ?? null);
});

export default router;
