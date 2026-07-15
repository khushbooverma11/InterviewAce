import { eq, and, inArray } from "drizzle-orm";
import {
  db,
  userStatsTable,
  achievementsTable,
  userAchievementsTable,
  topicProgressTable,
} from "@workspace/db";

export function levelForXp(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) /
      msPerDay,
  );
}

/**
 * Awards XP and rolls the daily streak forward. Call once per "activity" event
 * (topic step completion, pattern attempt, etc).
 */
export async function awardXpAndBumpStreak(userId: number, xpDelta: number) {
  const [stats] = await db
    .select()
    .from(userStatsTable)
    .where(eq(userStatsTable.userId, userId));

  if (!stats) {
    throw new Error(`No userStats row for userId=${userId}`);
  }

  const today = todayDateString();
  let streakCount = stats.streakCount;
  let longestStreak = stats.longestStreak;

  if (!stats.lastActiveDate) {
    streakCount = 1;
  } else {
    const diff = daysBetween(stats.lastActiveDate, today);
    if (diff === 0) {
      // already active today, streak unchanged
    } else if (diff === 1) {
      streakCount = stats.streakCount + 1;
    } else {
      streakCount = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streakCount);

  const xp = stats.xp + xpDelta;
  const level = levelForXp(xp);

  const [updated] = await db
    .update(userStatsTable)
    .set({
      xp,
      level,
      streakCount,
      longestStreak,
      lastActiveDate: today,
    })
    .where(eq(userStatsTable.userId, userId))
    .returning();

  return updated;
}

/** Grants any newly-earned achievements for the given codes (idempotent). */
export async function grantAchievements(userId: number, codes: string[]) {
  if (codes.length === 0) return;

  const achievements = await db
    .select()
    .from(achievementsTable)
    .where(inArray(achievementsTable.code, codes));

  for (const achievement of achievements) {
    await db
      .insert(userAchievementsTable)
      .values({ userId, achievementId: achievement.id })
      .onConflictDoNothing();
  }
}

/**
 * Central "what did the user just accomplish" achievement checker. Cheap to
 * call after every gamified action — each check is idempotent.
 */
export async function checkAndGrantAchievements(
  userId: number,
  event:
    | "topic_completed"
    | "pattern_mastery_100"
    | "first_post"
    | "first_comment"
    | "session_completed",
) {
  const codesToCheck: string[] = [];

  const [stats] = await db
    .select()
    .from(userStatsTable)
    .where(eq(userStatsTable.userId, userId));

  if (!stats) return;

  if (event === "topic_completed") {
    codesToCheck.push("first-topic");
    if (stats.totalTopicsCompleted >= 5) codesToCheck.push("five-topics");
  }
  if (event === "pattern_mastery_100") codesToCheck.push("pattern-master");
  if (event === "first_post") codesToCheck.push("first-post");
  if (event === "first_comment") codesToCheck.push("first-comment");
  if (event === "session_completed") codesToCheck.push("first-session");
  if (stats.streakCount >= 7) codesToCheck.push("week-streak");
  if (stats.xp >= 100) codesToCheck.push("hundred-xp");

  await grantAchievements(userId, codesToCheck);
}

/** Recomputes totalTopicsCompleted from topicProgress rows (called on topic completion). */
export async function bumpTopicsCompletedCount(userId: number) {
  const rows = await db
    .select()
    .from(topicProgressTable)
    .where(
      and(eq(topicProgressTable.userId, userId), eq(topicProgressTable.isCompleted, true)),
    );
  await db
    .update(userStatsTable)
    .set({ totalTopicsCompleted: rows.length })
    .where(eq(userStatsTable.userId, userId));
}
