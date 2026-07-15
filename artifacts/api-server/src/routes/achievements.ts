import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, achievementsTable, userAchievementsTable } from "@workspace/db";
import { ListAchievementsResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
router.use(requireAuth);

router.get("/achievements", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const all = await db.select().from(achievementsTable);
  const earned = await db
    .select()
    .from(userAchievementsTable)
    .where(eq(userAchievementsTable.userId, userId));
  const earnedByAchievement = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));

  res.json(
    ListAchievementsResponse.parse(
      all.map((a) => ({
        id: a.id,
        code: a.code,
        title: a.title,
        description: a.description,
        iconName: a.iconName,
        isEarned: earnedByAchievement.has(a.id),
        earnedAt: earnedByAchievement.get(a.id) ?? null,
      })),
    ),
  );
});

export default router;
