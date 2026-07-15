import { Router, type IRouter } from "express";
import { eq, desc, and, gt } from "drizzle-orm";
import {
  db,
  usersTable,
  userStatsTable,
  topicsTable,
  topicStepsTable,
  topicProgressTable,
  achievementsTable,
  userAchievementsTable,
  chatSessionsTable,
} from "@workspace/db";
import {
  GetMeResponse,
  UpdateMeBody,
  UpdateMeResponse,
  GetDashboardResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
router.use(requireAuth);

router.get("/me", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.appUser!.id));
  res.json(GetMeResponse.parse(user));
});

router.patch("/me", async (req, res): Promise<void> => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, req.appUser!.id))
    .returning();

  res.json(UpdateMeResponse.parse(updated));
});

router.get("/me/dashboard", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;

  const [stats] = await db
    .select()
    .from(userStatsTable)
    .where(eq(userStatsTable.userId, userId));

  const topics = await db.select().from(topicsTable).orderBy(topicsTable.order);
  const allSteps = await db.select().from(topicStepsTable);
  const progressRows = await db
    .select()
    .from(topicProgressTable)
    .where(eq(topicProgressTable.userId, userId));
  const progressByTopic = new Map(progressRows.map((p) => [p.topicId, p]));

  let nextTopic = null;
  for (const topic of topics) {
    const progress = progressByTopic.get(topic.id);
    if (!progress?.isCompleted) {
      const totalSteps = allSteps.filter((s) => s.topicId === topic.id).length;
      nextTopic = {
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        category: topic.category,
        order: topic.order,
        iconName: topic.iconName,
        difficulty: topic.difficulty,
        estimatedMinutes: topic.estimatedMinutes,
        totalSteps,
        completedSteps: progress?.completedStepNumbers.length ?? 0,
        isCompleted: false,
      };
      break;
    }
  }

  const earned = await db
    .select({
      id: achievementsTable.id,
      code: achievementsTable.code,
      title: achievementsTable.title,
      description: achievementsTable.description,
      iconName: achievementsTable.iconName,
      earnedAt: userAchievementsTable.earnedAt,
    })
    .from(userAchievementsTable)
    .innerJoin(achievementsTable, eq(userAchievementsTable.achievementId, achievementsTable.id))
    .where(eq(userAchievementsTable.userId, userId))
    .orderBy(desc(userAchievementsTable.earnedAt))
    .limit(3);

  const activeSessions = await db
    .select()
    .from(chatSessionsTable)
    .where(
      and(
        eq(chatSessionsTable.status, "active"),
      ),
    );
  const activeSessionCount = activeSessions.filter(
    (s) => s.userAId === userId || s.userBId === userId,
  ).length;

  res.json(
    GetDashboardResponse.parse({
      stats,
      nextTopic,
      recentAchievements: earned.map((a) => ({ ...a, isEarned: true })),
      activeSessionCount,
    }),
  );
});

export default router;
