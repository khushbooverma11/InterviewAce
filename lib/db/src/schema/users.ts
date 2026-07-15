import { pgTable, serial, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  displayName: text("display_name").notNull().default("Explorer"),
  anonymousHandle: text("anonymous_handle").notNull().unique(),
  avatarColor: text("avatar_color").notNull(),
  targetCompanies: jsonb("target_companies").$type<string[]>().notNull().default([]),
  isSeed: boolean("is_seed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
