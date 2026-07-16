import { Router, type IRouter } from "express";
import { eq, and, or, desc } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  friendshipsTable,
  usersTable,
  notificationsTable,
  chatSessionsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { sendToUser, getUserPresence } from "../ws-server";

const router: IRouter = Router();
router.use(requireAuth);

// Serialize a friend row into a response object
async function serializeFriend(
  friendship: typeof friendshipsTable.$inferSelect,
  viewerId: number,
) {
  const friendId =
    friendship.requesterId === viewerId ? friendship.recipientId : friendship.requesterId;
  const [friend] = await db.select().from(usersTable).where(eq(usersTable.id, friendId));
  return {
    friendshipId: friendship.id,
    userId: friendId,
    handle: friend?.anonymousHandle ?? "Unknown",
    avatarColor: friend?.avatarColor ?? "#7c6cff",
    status: friendship.status,
    isRequester: friendship.requesterId === viewerId,
    presence: getUserPresence(friendId),
    createdAt: friendship.createdAt,
  };
}

// ---------------------------------------------------------------------------
// GET /friends — accepted friends list
// ---------------------------------------------------------------------------
router.get("/friends", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  const rows = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        or(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.recipientId, userId),
        ),
        eq(friendshipsTable.status, "accepted"),
      ),
    )
    .orderBy(desc(friendshipsTable.updatedAt));

  const friends = await Promise.all(rows.map((r) => serializeFriend(r, userId)));
  res.json(friends);
});

// ---------------------------------------------------------------------------
// GET /friends/requests — pending requests (sent + received)
// ---------------------------------------------------------------------------
router.get("/friends/requests", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  const rows = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        or(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.recipientId, userId),
        ),
        eq(friendshipsTable.status, "pending"),
      ),
    )
    .orderBy(desc(friendshipsTable.createdAt));

  const requests = await Promise.all(rows.map((r) => serializeFriend(r, userId)));
  res.json(requests);
});

// ---------------------------------------------------------------------------
// POST /friends — send a friend request
// Body: { recipientId } or { sessionId } (auto-resolves partner)
// ---------------------------------------------------------------------------
router.post("/friends", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  const body = z
    .union([
      z.object({ recipientId: z.number().int().positive() }),
      z.object({ sessionId: z.number().int().positive() }),
    ])
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: "recipientId or sessionId is required" });
    return;
  }

  let recipientId: number;

  if ("recipientId" in body.data) {
    recipientId = body.data.recipientId;
  } else {
    // Resolve partner from session
    const [session] = await db
      .select()
      .from(chatSessionsTable)
      .where(
        and(
          eq(chatSessionsTable.id, body.data.sessionId),
          or(
            eq(chatSessionsTable.userAId, userId),
            eq(chatSessionsTable.userBId, userId),
          ),
        ),
      );
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    recipientId = session.userAId === userId ? session.userBId : session.userAId;
  }

  if (recipientId === userId) {
    res.status(400).json({ error: "Cannot befriend yourself" });
    return;
  }

  // Check existing friendship (in either direction)
  const [existing] = await db
    .select()
    .from(friendshipsTable)
    .where(
      or(
        and(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.recipientId, recipientId),
        ),
        and(
          eq(friendshipsTable.requesterId, recipientId),
          eq(friendshipsTable.recipientId, userId),
        ),
      ),
    );

  if (existing) {
    if (existing.status === "accepted") {
      res.status(409).json({ error: "Already friends" });
      return;
    }
    if (existing.status === "pending") {
      res.status(409).json({ error: "Friend request already pending" });
      return;
    }
    // Re-open a rejected request by updating it
    const [updated] = await db
      .update(friendshipsTable)
      .set({ status: "pending", requesterId: userId, recipientId, updatedAt: new Date() })
      .where(eq(friendshipsTable.id, existing.id))
      .returning();
    await notifyFriendRequest(userId, recipientId, updated.id);
    res.status(201).json(await serializeFriend(updated, userId));
    return;
  }

  const [sessionId] =
    "sessionId" in body.data ? [body.data.sessionId] : [undefined];

  const [friendship] = await db
    .insert(friendshipsTable)
    .values({
      requesterId: userId,
      recipientId,
      sessionId: sessionId ?? null,
    })
    .returning();

  await notifyFriendRequest(userId, recipientId, friendship.id);
  res.status(201).json(await serializeFriend(friendship, userId));
});

// ---------------------------------------------------------------------------
// PATCH /friends/:id — accept or reject a friend request
// Body: { action: 'accept' | 'reject' }
// ---------------------------------------------------------------------------
router.patch("/friends/:id", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const friendshipId = Number(req.params.id);

  const body = z
    .object({ action: z.enum(["accept", "reject"]) })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "action must be 'accept' or 'reject'" });
    return;
  }

  // Only the recipient can accept/reject
  const [friendship] = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        eq(friendshipsTable.id, friendshipId),
        eq(friendshipsTable.recipientId, userId),
        eq(friendshipsTable.status, "pending"),
      ),
    );

  if (!friendship) {
    res.status(404).json({ error: "Friend request not found" });
    return;
  }

  const newStatus = body.data.action === "accept" ? "accepted" : "rejected";
  const [updated] = await db
    .update(friendshipsTable)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(friendshipsTable.id, friendshipId))
    .returning();

  if (newStatus === "accepted") {
    // Notify requester their request was accepted
    await db.insert(notificationsTable).values({
      userId: friendship.requesterId,
      type: "friend_accepted",
      fromUserId: userId,
      refId: friendship.id,
      refType: "friendship",
    });
    const [me] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    sendToUser(friendship.requesterId, {
      type: "notification",
      notification: {
        type: "friend_accepted",
        fromHandle: me?.anonymousHandle ?? "Someone",
        fromAvatarColor: me?.avatarColor ?? "#7c6cff",
        fromUserId: userId,
        friendshipId: friendship.id,
      },
    });
  }

  res.json(await serializeFriend(updated, userId));
});

// ---------------------------------------------------------------------------
// DELETE /friends/:id — unfriend
// ---------------------------------------------------------------------------
router.delete("/friends/:id", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const friendshipId = Number(req.params.id);

  const [friendship] = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        eq(friendshipsTable.id, friendshipId),
        or(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.recipientId, userId),
        ),
      ),
    );

  if (!friendship) {
    res.status(404).json({ error: "Friendship not found" });
    return;
  }

  await db.delete(friendshipsTable).where(eq(friendshipsTable.id, friendshipId));
  res.sendStatus(204);
});

// ---------------------------------------------------------------------------
// POST /friends/:id/call — initiate a voice call to a friend
// ---------------------------------------------------------------------------
router.post("/friends/:id/call", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const friendshipId = Number(req.params.id);

  const [friendship] = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        eq(friendshipsTable.id, friendshipId),
        or(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.recipientId, userId),
        ),
        eq(friendshipsTable.status, "accepted"),
      ),
    );

  if (!friendship) {
    res.status(404).json({ error: "Friendship not found" });
    return;
  }

  const friendId =
    friendship.requesterId === userId ? friendship.recipientId : friendship.requesterId;

  if (getUserPresence(friendId) === "offline") {
    res.status(409).json({ error: "offline" });
    return;
  }

  const [me] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  // Create a voice session so VoiceCallView can be reused
  const [session] = await db
    .insert(chatSessionsTable)
    .values({
      userAId: userId,
      userBId: friendId,
      topic: "Friend Call",
      chatType: "voice",
      durationMinutes: 60,
    })
    .returning();

  // Push incoming call notification to the friend
  sendToUser(friendId, {
    type: "incoming_call",
    sessionId: session.id,
    friendshipId: friendship.id,
    callerId: userId,
    callerHandle: me?.anonymousHandle ?? "Unknown",
    callerColor: me?.avatarColor ?? "#7c6cff",
  });

  res.status(201).json({ sessionId: session.id });
});

// ---------------------------------------------------------------------------
// POST /friends/:id/block — block a friend (also removes friendship)
// ---------------------------------------------------------------------------
router.post("/friends/:id/block", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const friendshipId = Number(req.params.id);

  const [friendship] = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        eq(friendshipsTable.id, friendshipId),
        or(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.recipientId, userId),
        ),
      ),
    );

  if (!friendship) {
    res.status(404).json({ error: "Friendship not found" });
    return;
  }

  const friendId =
    friendship.requesterId === userId ? friendship.recipientId : friendship.requesterId;

  // Insert block (ignore if already blocked)
  const { userBlocksTable } = await import("@workspace/db");
  await db
    .insert(userBlocksTable)
    .values({ blockerId: userId, blockedId: friendId })
    .onConflictDoNothing();

  // Remove the friendship
  await db.delete(friendshipsTable).where(eq(friendshipsTable.id, friendshipId));

  res.sendStatus(204);
});

// ---------------------------------------------------------------------------
// POST /friends/:id/call/decline — decline an incoming call
// ---------------------------------------------------------------------------
router.post("/friends/:id/call/decline", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  const body = z.object({ sessionId: z.number().int().positive() }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  // Find the caller (userA) and notify them
  const [session] = await db
    .select()
    .from(chatSessionsTable)
    .where(eq(chatSessionsTable.id, body.data.sessionId));

  if (session) {
    sendToUser(session.userAId, { type: "call_declined", sessionId: body.data.sessionId });
    // End the session since call was declined
    await db
      .update(chatSessionsTable)
      .set({ status: "ended", endedAt: new Date() })
      .where(eq(chatSessionsTable.id, body.data.sessionId));
  }

  res.sendStatus(204);
});

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

async function notifyFriendRequest(fromUserId: number, toUserId: number, friendshipId: number) {
  await db.insert(notificationsTable).values({
    userId: toUserId,
    type: "friend_request",
    fromUserId,
    refId: friendshipId,
    refType: "friendship",
  });
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, fromUserId));
  sendToUser(toUserId, {
    type: "notification",
    notification: {
      type: "friend_request",
      fromHandle: sender?.anonymousHandle ?? "Someone",
      fromAvatarColor: sender?.avatarColor ?? "#7c6cff",
      fromUserId,
      friendshipId,
    },
  });
}

export default router;
