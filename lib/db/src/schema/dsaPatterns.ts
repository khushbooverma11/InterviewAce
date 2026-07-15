import { pgTable, serial, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dsaPatternsTable = pgTable("dsa_patterns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  recognitionClues: text("recognition_clues").notNull(),
  timeComplexity: text("time_complexity").notNull(),
  spaceComplexity: text("space_complexity").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
});

export const insertDsaPatternSchema = createInsertSchema(dsaPatternsTable).omit({ id: true });
export type InsertDsaPattern = z.infer<typeof insertDsaPatternSchema>;
export type DsaPattern = typeof dsaPatternsTable.$inferSelect;
