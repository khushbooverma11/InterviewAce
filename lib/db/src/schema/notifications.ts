import { pgTable, serial, integer, text, pgEnum, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "friend_request",
  "friend_accepted",
  "new_message",
  "incoming_call",
  "session_ended",
  "feedback_received",
]);

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  /** Who receives this notification. */
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  /** Who triggered the notification (null for system notifications). */
  fromUserId: integer("from_user_id").references(() => usersTable.id, { onDelete: "set null" }),
  /** Related entity id (friendshipId, sessionId, dmId, etc.). */
  refId: integer("ref_id"),
  /** Type string for the ref ("friendship" | "session" | "message"). */
  refType: text("ref_type"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
