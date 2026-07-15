import { pgTable, serial, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { topicsTable } from "./topics";

export const stepTypeEnum = pgEnum("step_type", [
  "introduction",
  "real_life_example",
  "core_concepts",
  "industry_usage",
  "revision_notes",
  "interview_questions",
  "common_mistakes",
  "revision_card",
]);

export const topicStepsTable = pgTable("topic_steps", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => topicsTable.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  stepType: stepTypeEnum("step_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

export const insertTopicStepSchema = createInsertSchema(topicStepsTable).omit({ id: true });
export type InsertTopicStep = z.infer<typeof insertTopicStepSchema>;
export type TopicStep = typeof topicStepsTable.$inferSelect;
