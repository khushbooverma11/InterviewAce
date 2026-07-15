import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { chatSessionsTable } from "./chatSessions";
import { usersTable } from "./users";

/**
 * Ephemeral signaling records for WebRTC offer/answer/ICE exchange.
 * Each row is consumed (marked consumed=true) once the recipient reads it.
 */
export const webrtcSignalsTable = pgTable("webrtc_signals", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => chatSessionsTable.id, { onDelete: "cascade" }),
  senderId: integer("sender_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "offer" | "answer" | "ice-candidate" | "hangup"
  payload: text("payload").notNull(), // JSON-serialised RTCSessionDescription / RTCIceCandidate
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WebrtcSignal = typeof webrtcSignalsTable.$inferSelect;
