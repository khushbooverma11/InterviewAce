import { pgTable, serial, text, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const topicDifficultyEnum = pgEnum("topic_difficulty", ["beginner", "intermediate", "advanced"]);

export const topicsTable = pgTable("topics", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  order: integer("order").notNull(),
  iconName: text("icon_name").notNull(),
  difficulty: topicDifficultyEnum("difficulty").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
});

export const insertTopicSchema = createInsertSchema(topicsTable).omit({ id: true });
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topicsTable.$inferSelect;
