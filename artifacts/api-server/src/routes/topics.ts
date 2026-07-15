import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  topicsTable,
  topicStepsTable,
  topicProgressTable,
} from "@workspace/db";
import {
  ListTopicsResponse,
  GetTopicParams,
  GetTopicResponse,
  UpdateTopicProgressParams,
  UpdateTopicProgressBody,
  UpdateTopicProgressResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import {
  awardXpAndBumpStreak,
  bumpTopicsCompletedCount,
  checkAndGrantAchievements,
} from "../lib/gamification";

const router: IRouter = Router();
router.use(requireAuth);

const STEP_XP = 20;
const TOPIC_COMPLETION_BONUS_XP = 50;

router.get("/topics", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const topics = await db.select().from(topicsTable).orderBy(topicsTable.order);
  const allSteps = await db.select().from(topicStepsTable);
  const progressRows = await db
    .select()
    .from(topicProgressTable)
    .where(eq(topicProgressTable.userId, userId));
  const progressByTopic = new Map(progressRows.map((p) => [p.topicId, p]));

  const result = topics.map((topic) => {
    const totalSteps = allSteps.filter((s) => s.topicId === topic.id).length;
    const progress = progressByTopic.get(topic.id);
    return {
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
      isCompleted: progress?.isCompleted ?? false,
    };
  });

  res.json(ListTopicsResponse.parse(result));
});

router.get("/topics/:slug", async (req, res): Promise<void> => {
  const params = GetTopicParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const [topic] = await db
    .select()
    .from(topicsTable)
    .where(eq(topicsTable.slug, params.data.slug));
  if (!topic) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  const steps = await db
    .select()
    .from(topicStepsTable)
    .where(eq(topicStepsTable.topicId, topic.id))
    .orderBy(topicStepsTable.stepNumber);

  const [progress] = await db
    .select()
    .from(topicProgressTable)
    .where(and(eq(topicProgressTable.userId, userId), eq(topicProgressTable.topicId, topic.id)));

  const completedSet = new Set(progress?.completedStepNumbers ?? []);

  res.json(
    GetTopicResponse.parse({
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      category: topic.category,
      difficulty: topic.difficulty,
      estimatedMinutes: topic.estimatedMinutes,
      steps: steps.map((s) => ({
        id: s.id,
        stepNumber: s.stepNumber,
        stepType: s.stepType,
        title: s.title,
        content: s.content,
        isCompleted: completedSet.has(s.stepNumber),
      })),
      currentStep: progress?.currentStep ?? 1,
    }),
  );
});

router.post("/topics/:slug/progress", async (req, res): Promise<void> => {
  const params = UpdateTopicProgressParams.safeParse(req.params);
  const body = UpdateTopicProgressBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)!.message });
    return;
  }
  const userId = req.appUser!.id;

  const [topic] = await db
    .select()
    .from(topicsTable)
    .where(eq(topicsTable.slug, params.data.slug));
  if (!topic) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  const totalSteps = (
    await db.select().from(topicStepsTable).where(eq(topicStepsTable.topicId, topic.id))
  ).length;

  const [existing] = await db
    .select()
    .from(topicProgressTable)
    .where(and(eq(topicProgressTable.userId, userId), eq(topicProgressTable.topicId, topic.id)));

  const priorCompleted = new Set(existing?.completedStepNumbers ?? []);
  const isNewStep = !priorCompleted.has(body.data.stepNumber);
  priorCompleted.add(body.data.stepNumber);
  const completedStepNumbers = Array.from(priorCompleted).sort((a, b) => a - b);
  const isCompleted = completedStepNumbers.length >= totalSteps;
  const wasAlreadyCompleted = existing?.isCompleted ?? false;
  const currentStep = Math.min(body.data.stepNumber + 1, totalSteps);

  let progress;
  if (existing) {
    [progress] = await db
      .update(topicProgressTable)
      .set({
        completedStepNumbers,
        currentStep,
        isCompleted,
        completedAt: isCompleted && !wasAlreadyCompleted ? new Date() : existing.completedAt,
      })
      .where(eq(topicProgressTable.id, existing.id))
      .returning();
  } else {
    [progress] = await db
      .insert(topicProgressTable)
      .values({
        userId,
        topicId: topic.id,
        completedStepNumbers,
        currentStep,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      })
      .returning();
  }

  let xpAwarded = 0;
  if (isNewStep) {
    xpAwarded += STEP_XP;
  }
  if (isCompleted && !wasAlreadyCompleted) {
    xpAwarded += TOPIC_COMPLETION_BONUS_XP;
  }

  if (xpAwarded > 0) {
    await awardXpAndBumpStreak(userId, xpAwarded);
  }

  if (isCompleted && !wasAlreadyCompleted) {
    await bumpTopicsCompletedCount(userId);
    await checkAndGrantAchievements(userId, "topic_completed");
  }

  res.json(
    UpdateTopicProgressResponse.parse({
      topicId: topic.id,
      completedStepNumbers: progress.completedStepNumbers,
      currentStep: progress.currentStep,
      isCompleted: progress.isCompleted,
      xpAwarded,
    }),
  );
});

export default router;
