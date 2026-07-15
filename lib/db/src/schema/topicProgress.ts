import { pgTable, serial, integer, boolean, jsonb, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { topicsTable } from "./topics";

export const topicProgressTable = pgTable("topic_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  topicId: integer("topic_id").notNull().references(() => topicsTable.id, { onDelete: "cascade" }),
  completedStepNumbers: jsonb("completed_step_numbers").$type<number[]>().notNull().default([]),
  currentStep: integer("current_step").notNull().default(1),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (t) => [
  unique("topic_progress_user_topic_unique").on(t.userId, t.topicId),
]);

export const insertTopicProgressSchema = createInsertSchema(topicProgressTable).omit({ id: true });
export type InsertTopicProgress = z.infer<typeof insertTopicProgressSchema>;
export type TopicProgress = typeof topicProgressTable.$inferSelect;
