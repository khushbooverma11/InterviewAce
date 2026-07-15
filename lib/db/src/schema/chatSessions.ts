import { pgTable, serial, integer, text, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const chatTypeEnum = pgEnum("chat_type", ["text", "voice"]);
export const sessionStatusEnum = pgEnum("session_status", ["active", "ended"]);

export const chatSessionsTable = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userAId: integer("user_a_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  userBId: integer("user_b_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  chatType: chatTypeEnum("chat_type").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  status: sessionStatusEnum("status").notNull().default("active"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
});

export const insertChatSessionSchema = createInsertSchema(chatSessionsTable).omit({ id: true, startedAt: true });
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessionsTable.$inferSelect;
