import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable, userStatsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const ADJECTIVES = [
  "Quiet",
  "Swift",
  "Bold",
  "Sharp",
  "Calm",
  "Bright",
  "Clever",
  "Steady",
  "Nimble",
  "Curious",
  "Focused",
  "Silent",
  "Rapid",
  "Wise",
  "Daring",
];

const ANIMALS = [
  "Falcon",
  "Otter",
  "Panther",
  "Sparrow",
  "Fox",
  "Wolf",
  "Heron",
  "Lynx",
  "Raven",
  "Badger",
  "Hawk",
  "Cobra",
  "Tiger",
  "Owl",
  "Marlin",
];

const AVATAR_COLORS = [
  "#7c6cff",
  "#4fd8e8",
  "#3ddc97",
  "#ff9f5a",
  "#ff6b81",
  "#c792ea",
  "#5ac8fa",
  "#ffd166",
];

function randomHandle(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${adjective}${animal}${number}`;
}

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function getDevelopmentFallbackUserId(req: Request): string | undefined {
  const explicitId = req.get("x-dev-clerk-user-id") ?? req.get("x-dev-user-id");
  if (explicitId) return explicitId;

  const authHeader = req.get("authorization");
  const bearerMatch = authHeader?.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch?.[1]?.startsWith("dev-")) {
    return bearerMatch[1].slice(4);
  }

  if (process.env.NODE_ENV !== "production" && !process.env.CLERK_SECRET_KEY) {
    return "local-dev-user";
  }

  return undefined;
}

/**
 * Resolves (and JIT-provisions) the local `users` row for a Clerk user id.
 * Retries on unique-constraint races (two concurrent first-requests).
 */
export async function resolveUser(clerkUserId: string) {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId));

  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [created] = await db
        .insert(usersTable)
        .values({
          clerkUserId,
          displayName: "Explorer",
          anonymousHandle: randomHandle(),
          avatarColor: randomAvatarColor(),
          targetCompanies: [],
        })
        .returning();

      await db
        .insert(userStatsTable)
        .values({ userId: created.id })
        .onConflictDoNothing();

      return created;
    } catch (err) {
      // Unique violation (handle collision or duplicate insert race) — retry.
      const [again] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerkUserId, clerkUserId));
      if (again) return again;
      logger.warn({ err, attempt }, "Retrying user provisioning after conflict");
    }
  }

  throw new Error(`Failed to provision user for clerkUserId=${clerkUserId}`);
}

declare global {
  namespace Express {
    interface Request {
      appUser?: { id: number; clerkUserId: string };
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const devFallbackUserId = getDevelopmentFallbackUserId(req);

  req.log.info({
    authUserId: auth?.userId ?? null,
    hasAuthHeader: !!req.headers.authorization,
    authHeaderPrefix: req.headers.authorization?.slice(0, 20) ?? null,
    hasCookie: !!req.headers.cookie,
    devFallbackUserId: devFallbackUserId ?? null,
  }, "requireAuth check");

  if (auth?.userId) {
    try {
      const user = await resolveUser(auth.userId);
      req.appUser = { id: user.id, clerkUserId: auth.userId };
      next();
      return;
    } catch (err) {
      req.log.error({ err }, "Failed to resolve authenticated user");
      res.status(500).json({ error: "Failed to resolve user" });
      return;
    }
  }

  if (devFallbackUserId) {
    try {
      req.log.warn({ devFallbackUserId }, "Using development auth fallback");
      const user = await resolveUser(devFallbackUserId);
      req.appUser = { id: user.id, clerkUserId: devFallbackUserId };
      next();
      return;
    } catch (err) {
      req.log.error({ err, devFallbackUserId }, "Failed to resolve development fallback user");
      res.status(500).json({ error: "Failed to resolve user" });
      return;
    }
  }

  res.status(401).json({ error: "Unauthorized" });
}
