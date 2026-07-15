import { pgTable, serial, integer, text, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { chatSessionsTable } from "./chatSessions";

export const skillLevelEnum = pgEnum("skill_level", ["beginner", "intermediate", "advanced", "any"]);
export const matchStatusEnum = pgEnum("match_status", ["waiting", "matched", "cancelled", "expired"]);

export const matchRequestsTable = pgTable("match_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  skillLevel: skillLevelEnum("skill_level").notNull(),
  chatType: text("chat_type").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  language: text("language"),
  status: matchStatusEnum("status").notNull().default("waiting"),
  sessionId: integer("session_id").references(() => chatSessionsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMatchRequestSchema = createInsertSchema(matchRequestsTable).omit({ id: true, createdAt: true });
export type InsertMatchRequest = z.infer<typeof insertMatchRequestSchema>;
export type MatchRequest = typeof matchRequestsTable.$inferSelect;
