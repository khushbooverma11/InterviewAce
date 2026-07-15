import { pgTable, serial, integer, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { dsaPatternsTable } from "./dsaPatterns";

export const patternProgressTable = pgTable("pattern_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  patternId: integer("pattern_id").notNull().references(() => dsaPatternsTable.id, { onDelete: "cascade" }),
  questionsAttempted: integer("questions_attempted").notNull().default(0),
  questionsSolved: integer("questions_solved").notNull().default(0),
  solvedQuestionIds: jsonb("solved_question_ids").$type<number[]>().notNull().default([]),
}, (t) => [
  unique("pattern_progress_user_pattern_unique").on(t.userId, t.patternId),
]);

export const insertPatternProgressSchema = createInsertSchema(patternProgressTable).omit({ id: true });
export type InsertPatternProgress = z.infer<typeof insertPatternProgressSchema>;
export type PatternProgress = typeof patternProgressTable.$inferSelect;
