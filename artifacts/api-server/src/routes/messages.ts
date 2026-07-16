import { Router, type IRouter } from "express";
import { eq, and, or, asc, desc, lt } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  directMessagesTable,
  friendshipsTable,
  usersTable,
  notificationsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { sendToUser } from "../ws-server";

const router: IRouter = Router();
router.use(requireAuth);

/** Verify two users are accepted friends. */
async function areFriends(userA: number, userB: number): Promise<boolean> {
  const [row] = await db
    .select({ id: friendshipsTable.id })
    .from(friendshipsTable)
    .where(
      and(
        or(
          and(eq(friendshipsTable.requesterId, userA), eq(friendshipsTable.recipientId, userB)),
          and(eq(friendshipsTable.requesterId, userB), eq(friendshipsTable.recipientId, userA)),
        ),
        eq(friendshipsTable.status, "accepted"),
      ),
    );
  return !!row;
}

// ---------------------------------------------------------------------------
// GET /messages/:friendId — list DMs (50 most recent, or before cursor)
// ---------------------------------------------------------------------------
router.get("/messages/:friendId", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const friendId = Number(req.params.friendId);

  if (!(await areFriends(userId, friendId))) {
    res.status(403).json({ error: "Not friends" });
    return;
  }

  const before = req.query.before ? Number(req.query.before) : undefined;

  const query = db
    .select()
    .from(directMessagesTable)
    .where(
      and(
        or(
          and(
            eq(directMessagesTable.senderId, userId),
            eq(directMessagesTable.recipientId, friendId),
          ),
          and(
            eq(directMessagesTable.senderId, friendId),
            eq(directMessagesTable.recipientId, userId),
          ),
        ),
        ...(before !== undefined ? [lt(directMessagesTable.id, before)] : []),
      ),
    )
    .orderBy(desc(directMessagesTable.createdAt))
    .limit(50);

  const rows = await query;

  // Mark unread messages (sent by friend to me) as read
  const unread = rows.filter((m) => m.recipientId === userId && !m.read);
  if (unread.length > 0) {
    await Promise.all(
      unread.map((m) =>
        db
          .update(directMessagesTable)
          .set({ read: true })
          .where(eq(directMessagesTable.id, m.id)),
      ),
    );
    // Let the friend know their messages were read
    sendToUser(friendId, { type: "dm_read", byUserId: userId });
  }

  res.json(rows.reverse().map(serializeMsg));
});

// ---------------------------------------------------------------------------
// POST /messages/:friendId — send a DM
// ---------------------------------------------------------------------------
router.post("/messages/:friendId", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const friendId = Number(req.params.friendId);

  if (!(await areFriends(userId, friendId))) {
    res.status(403).json({ error: "Not friends" });
    return;
  }

  const body = z
    .object({
      content: z.string().trim().min(1).max(4000),
      type: z.enum(["text", "code"]).default("text"),
    })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [message] = await db
    .insert(directMessagesTable)
    .values({
      senderId: userId,
      recipientId: friendId,
      content: body.data.content,
      type: body.data.type,
    })
    .returning();

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  const serialized = serializeMsg(message);

  // Real-time delivery via WS
  const delivered = sendToUser(friendId, { type: "dm", message: serialized });

  // Create DB notification if not delivered in real-time
  if (!delivered) {
    await db.insert(notificationsTable).values({
      userId: friendId,
      type: "new_message",
      fromUserId: userId,
      refId: message.id,
      refType: "message",
    });
  }

  res.status(201).json(serialized);
});

// ---------------------------------------------------------------------------
// GET /messages — list all DM conversations (last message per friend)
// ---------------------------------------------------------------------------
router.get("/messages", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  // Get accepted friends
  const friendships = await db
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
    );

  const convos = await Promise.all(
    friendships.map(async (f) => {
      const friendId = f.requesterId === userId ? f.recipientId : f.requesterId;
      const [friend] = await db.select().from(usersTable).where(eq(usersTable.id, friendId));
      const [last] = await db
        .select()
        .from(directMessagesTable)
        .where(
          or(
            and(
              eq(directMessagesTable.senderId, userId),
              eq(directMessagesTable.recipientId, friendId),
            ),
            and(
              eq(directMessagesTable.senderId, friendId),
              eq(directMessagesTable.recipientId, userId),
            ),
          ),
        )
        .orderBy(desc(directMessagesTable.createdAt))
        .limit(1);
      return {
        friendshipId: f.id,
        friendId,
        handle: friend?.anonymousHandle ?? "Unknown",
        avatarColor: friend?.avatarColor ?? "#7c6cff",
        lastMessage: last ? serializeMsg(last) : null,
      };
    }),
  );

  // Sort by last message time descending
  convos.sort((a, b) => {
    const at = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bt = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bt - at;
  });

  res.json(convos);
});

function serializeMsg(m: typeof directMessagesTable.$inferSelect) {
  return {
    id: m.id,
    senderId: m.senderId,
    recipientId: m.recipientId,
    content: m.content,
    type: m.type,
    read: m.read,
    createdAt: m.createdAt,
  };
}

export default router;
