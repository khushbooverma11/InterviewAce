import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  dsaPatternsTable,
  patternQuestionsTable,
  patternProgressTable,
  userStatsTable,
} from "@workspace/db";
import {
  ListPatternsResponse,
  GetPatternParams,
  GetPatternResponse,
  RecordPatternAttemptParams,
  RecordPatternAttemptBody,
  RecordPatternAttemptResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { awardXpAndBumpStreak, checkAndGrantAchievements } from "../lib/gamification";

const router: IRouter = Router();
router.use(requireAuth);

const SOLVE_XP = 15;

function mastery(solved: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((solved / total) * 100));
}

router.get("/patterns", async (req, res): Promise<void> => {
  const userId = req.appUser!.id;
  const patterns = await db.select().from(dsaPatternsTable);
  const questions = await db.select().from(patternQuestionsTable);
  const progressRows = await db
    .select()
    .from(patternProgressTable)
    .where(eq(patternProgressTable.userId, userId));
  const progressByPattern = new Map(progressRows.map((p) => [p.patternId, p]));

  const result = patterns.map((pattern) => {
    const questionCount = questions.filter((q) => q.patternId === pattern.id).length;
    const progress = progressByPattern.get(pattern.id);
    return {
      id: pattern.id,
      slug: pattern.slug,
      name: pattern.name,
      description: pattern.description,
      timeComplexity: pattern.timeComplexity,
      spaceComplexity: pattern.spaceComplexity,
      tags: pattern.tags,
      masteryPercent: mastery(progress?.questionsSolved ?? 0, questionCount),
      questionCount,
    };
  });

  res.json(ListPatternsResponse.parse(result));
});

router.get("/patterns/:slug", async (req, res): Promise<void> => {
  const params = GetPatternParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const [pattern] = await db
    .select()
    .from(dsaPatternsTable)
    .where(eq(dsaPatternsTable.slug, params.data.slug));
  if (!pattern) {
    res.status(404).json({ error: "Pattern not found" });
    return;
  }

  const questions = await db
    .select()
    .from(patternQuestionsTable)
    .where(eq(patternQuestionsTable.patternId, pattern.id));

  const [progress] = await db
    .select()
    .from(patternProgressTable)
    .where(and(eq(patternProgressTable.userId, userId), eq(patternProgressTable.patternId, pattern.id)));

  const solvedSet = new Set(progress?.solvedQuestionIds ?? []);

  res.json(
    GetPatternResponse.parse({
      id: pattern.id,
      slug: pattern.slug,
      name: pattern.name,
      description: pattern.description,
      recognitionClues: pattern.recognitionClues,
      timeComplexity: pattern.timeComplexity,
      spaceComplexity: pattern.spaceComplexity,
      tags: pattern.tags,
      masteryPercent: mastery(solvedSet.size, questions.length),
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty,
        description: q.description,
        hint: q.hint,
        isSolved: solvedSet.has(q.id),
      })),
    }),
  );
});

router.post("/patterns/:slug/attempt", async (req, res): Promise<void> => {
  const params = RecordPatternAttemptParams.safeParse(req.params);
  const body = RecordPatternAttemptBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)!.message });
    return;
  }
  const userId = req.appUser!.id;

  const [pattern] = await db
    .select()
    .from(dsaPatternsTable)
    .where(eq(dsaPatternsTable.slug, params.data.slug));
  if (!pattern) {
    res.status(404).json({ error: "Pattern not found" });
    return;
  }

  const totalQuestions = (
    await db.select().from(patternQuestionsTable).where(eq(patternQuestionsTable.patternId, pattern.id))
  ).length;

  const [existing] = await db
    .select()
    .from(patternProgressTable)
    .where(and(eq(patternProgressTable.userId, userId), eq(patternProgressTable.patternId, pattern.id)));

  const solvedSet = new Set(existing?.solvedQuestionIds ?? []);
  const isNewSolve = body.data.solved && !solvedSet.has(body.data.questionId);
  if (body.data.solved) solvedSet.add(body.data.questionId);
  const solvedQuestionIds = Array.from(solvedSet);
  const questionsAttempted = (existing?.questionsAttempted ?? 0) + 1;

  let progress;
  if (existing) {
    [progress] = await db
      .update(patternProgressTable)
      .set({ questionsAttempted, questionsSolved: solvedQuestionIds.length, solvedQuestionIds })
      .where(eq(patternProgressTable.id, existing.id))
      .returning();
  } else {
    [progress] = await db
      .insert(patternProgressTable)
      .values({
        userId,
        patternId: pattern.id,
        questionsAttempted,
        questionsSolved: solvedQuestionIds.length,
        solvedQuestionIds,
      })
      .returning();
  }

  if (isNewSolve) {
    await awardXpAndBumpStreak(userId, SOLVE_XP);
    const totalSolvedAcrossPatterns = (
      await db.select().from(patternProgressTable).where(eq(patternProgressTable.userId, userId))
    ).reduce((sum, p) => sum + p.questionsSolved, 0);
    await db
      .update(userStatsTable)
      .set({ totalProblemsSolved: totalSolvedAcrossPatterns })
      .where(eq(userStatsTable.userId, userId));
  }

  const masteryPercent = mastery(solvedQuestionIds.length, totalQuestions);
  if (masteryPercent >= 100) {
    await checkAndGrantAchievements(userId, "pattern_mastery_100");
  }

  res.json(
    RecordPatternAttemptResponse.parse({
      patternId: pattern.id,
      masteryPercent,
      questionsAttempted: progress.questionsAttempted,
      questionsSolved: progress.questionsSolved,
    }),
  );
});

export default router;
