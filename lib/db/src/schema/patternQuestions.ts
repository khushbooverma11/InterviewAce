import { pgTable, serial, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { dsaPatternsTable } from "./dsaPatterns";

export const questionDifficultyEnum = pgEnum("question_difficulty", ["easy", "medium", "hard"]);

export const patternQuestionsTable = pgTable("pattern_questions", {
  id: serial("id").primaryKey(),
  patternId: integer("pattern_id").notNull().references(() => dsaPatternsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  difficulty: questionDifficultyEnum("difficulty").notNull(),
  description: text("description").notNull(),
  hint: text("hint").notNull(),
});

export const insertPatternQuestionSchema = createInsertSchema(patternQuestionsTable).omit({ id: true });
export type InsertPatternQuestion = z.infer<typeof insertPatternQuestionSchema>;
export type PatternQuestion = typeof patternQuestionsTable.$inferSelect;
