import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { achievementsTable } from "./achievements";

export const userAchievementsTable = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  achievementId: integer("achievement_id").notNull().references(() => achievementsTable.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("user_achievements_user_achievement_unique").on(t.userId, t.achievementId),
]);

export const insertUserAchievementSchema = createInsertSchema(userAchievementsTable).omit({ id: true, earnedAt: true });
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievementsTable.$inferSelect;
