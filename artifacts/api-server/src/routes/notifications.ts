import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, notificationsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { issuePersonalWsTicket } from "../ws-tickets";

const router: IRouter = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------------
// GET /notifications — list recent notifications (50)
// ---------------------------------------------------------------------------
router.get("/notifications", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  // Enrich with sender handle
  const enriched = await Promise.all(
    rows.map(async (n) => {
      let fromHandle: string | null = null;
      let fromAvatarColor: string | null = null;
      if (n.fromUserId) {
        const [u] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, n.fromUserId));
        fromHandle = u?.anonymousHandle ?? null;
        fromAvatarColor = u?.avatarColor ?? null;
      }
      return {
        id: n.id,
        type: n.type,
        fromUserId: n.fromUserId,
        fromHandle,
        fromAvatarColor,
        refId: n.refId,
        refType: n.refType,
        read: n.read,
        createdAt: n.createdAt,
      };
    }),
  );

  res.json(enriched);
});

// ---------------------------------------------------------------------------
// PATCH /notifications/:id/read — mark one notification as read
// ---------------------------------------------------------------------------
router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const notifId = Number(req.params.id);

  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, notifId), eq(notificationsTable.userId, userId)));

  res.sendStatus(204);
});

// ---------------------------------------------------------------------------
// POST /notifications/read-all — mark all notifications as read
// ---------------------------------------------------------------------------
router.post("/notifications/read-all", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, userId));

  res.sendStatus(204);
});

// ---------------------------------------------------------------------------
// GET /notifications/unread-count — fast count badge
// ---------------------------------------------------------------------------
router.get("/notifications/unread-count", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  const rows = await db
    .select({ id: notificationsTable.id })
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));

  res.json({ count: rows.length });
});

// ---------------------------------------------------------------------------
// GET /me/ws-ticket — personal WS ticket for DMs / notifications / presence
// ---------------------------------------------------------------------------
router.get("/me/ws-ticket", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const ticket = issuePersonalWsTicket(userId);
  res.json({ ticket });
});

export default router;
