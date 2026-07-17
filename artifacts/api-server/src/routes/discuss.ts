import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import {
  db,
  discussPostsTable,
  postUpvotesTable,
  postCommentsTable,
  usersTable,
} from "@workspace/db";
import {
  ListDiscussPostsQueryParams,
  ListDiscussPostsResponse,
  CreateDiscussPostBody,
  CreateDiscussPostResponse,
  GetDiscussPostParams,
  GetDiscussPostResponse,
  DeleteDiscussPostParams,
  CreatePostCommentParams,
  CreatePostCommentBody,
  CreatePostCommentResponse,
  ToggleDiscussPostUpvoteParams,
  ToggleDiscussPostUpvoteResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { checkAndGrantAchievements } from "../lib/gamification";

const router: IRouter = Router();
router.use(requireAuth);

async function serializePost(postId: number, viewerId: number) {
  const [row] = await db
    .select({
      id: discussPostsTable.id,
      authorId: discussPostsTable.authorId,
      authorHandle: usersTable.anonymousHandle,
      avatarColor: usersTable.avatarColor,
      type: discussPostsTable.type,
      title: discussPostsTable.title,
      content: discussPostsTable.content,
      topicTag: discussPostsTable.topicTag,
      upvoteCount: discussPostsTable.upvoteCount,
      commentCount: discussPostsTable.commentCount,
      createdAt: discussPostsTable.createdAt,
    })
    .from(discussPostsTable)
    .innerJoin(usersTable, eq(discussPostsTable.authorId, usersTable.id))
    .where(eq(discussPostsTable.id, postId));

  if (!row) return null;

  const [upvote] = await db
    .select()
    .from(postUpvotesTable)
    .where(and(eq(postUpvotesTable.postId, postId), eq(postUpvotesTable.userId, viewerId)));

  return {
    ...row,
    isUpvotedByMe: !!upvote,
    isMine: row.authorId === viewerId,
  };
}

router.get("/discuss/posts", async (req, res): Promise<void> => {
  const query = ListDiscussPostsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const rows = await db
    .select({
      id: discussPostsTable.id,
      authorId: discussPostsTable.authorId,
      authorHandle: usersTable.anonymousHandle,
      avatarColor: usersTable.avatarColor,
      type: discussPostsTable.type,
      title: discussPostsTable.title,
      content: discussPostsTable.content,
      topicTag: discussPostsTable.topicTag,
      upvoteCount: discussPostsTable.upvoteCount,
      commentCount: discussPostsTable.commentCount,
      createdAt: discussPostsTable.createdAt,
    })
    .from(discussPostsTable)
    .innerJoin(usersTable, eq(discussPostsTable.authorId, usersTable.id))
    .where(query.data.topicTag ? eq(discussPostsTable.topicTag, query.data.topicTag) : undefined)
    .orderBy(desc(discussPostsTable.createdAt));

  const myUpvotes = await db
    .select()
    .from(postUpvotesTable)
    .where(eq(postUpvotesTable.userId, userId));
  const upvotedSet = new Set(myUpvotes.map((u) => u.postId));

  res.json(
    ListDiscussPostsResponse.parse(
      rows.map((r) => ({
        ...r,
        isUpvotedByMe: upvotedSet.has(r.id),
        isMine: r.authorId === userId,
      })),
    ),
  );
});

router.post("/discuss/posts", async (req, res): Promise<void> => {
  const parsed = CreateDiscussPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const [post] = await db
    .insert(discussPostsTable)
    .values({
      authorId: userId,
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
      topicTag: parsed.data.topicTag ?? null,
    })
    .returning();

  await checkAndGrantAchievements(userId, "first_post");

  const serialized = await serializePost(post.id, userId);
  res.status(201).json(CreateDiscussPostResponse.parse(serialized));
});

router.get("/discuss/posts/:id", async (req, res): Promise<void> => {
  const params = GetDiscussPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const post = await serializePost(params.data.id, userId);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const commentRows = await db
    .select({
      id: postCommentsTable.id,
      postId: postCommentsTable.postId,
      authorId: postCommentsTable.authorId,
      authorHandle: usersTable.anonymousHandle,
      avatarColor: usersTable.avatarColor,
      content: postCommentsTable.content,
      createdAt: postCommentsTable.createdAt,
    })
    .from(postCommentsTable)
    .innerJoin(usersTable, eq(postCommentsTable.authorId, usersTable.id))
    .where(eq(postCommentsTable.postId, params.data.id))
    .orderBy(postCommentsTable.createdAt);

  const comments = commentRows.map((c) => ({ ...c, isMine: c.authorId === userId }));

  res.json(GetDiscussPostResponse.parse({ post, comments }));
});

router.delete("/discuss/posts/:id/comments/:commentId", async (req, res): Promise<void> => {
  const postId = Number(req.params.id);
  const commentId = Number(req.params.commentId);
  if (isNaN(postId) || isNaN(commentId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const userId = req.appUser!.id;

  const [deleted] = await db
    .delete(postCommentsTable)
    .where(and(eq(postCommentsTable.id, commentId), eq(postCommentsTable.authorId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Comment not found or not yours" });
    return;
  }

  // Decrement comment count
  const [post] = await db.select().from(discussPostsTable).where(eq(discussPostsTable.id, postId));
  if (post) {
    await db
      .update(discussPostsTable)
      .set({ commentCount: Math.max(0, post.commentCount - 1) })
      .where(eq(discussPostsTable.id, postId));
  }

  res.sendStatus(204);
});

router.delete("/discuss/posts/:id", async (req, res): Promise<void> => {
  const params = DeleteDiscussPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const [deleted] = await db
    .delete(discussPostsTable)
    .where(and(eq(discussPostsTable.id, params.data.id), eq(discussPostsTable.authorId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/discuss/posts/:id/comments", async (req, res): Promise<void> => {
  const params = CreatePostCommentParams.safeParse(req.params);
  const body = CreatePostCommentBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)!.message });
    return;
  }
  const userId = req.appUser!.id;

  const [post] = await db
    .select()
    .from(discussPostsTable)
    .where(eq(discussPostsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const [comment] = await db
    .insert(postCommentsTable)
    .values({ postId: params.data.id, authorId: userId, content: body.data.content })
    .returning();

  await db
    .update(discussPostsTable)
    .set({ commentCount: post.commentCount + 1 })
    .where(eq(discussPostsTable.id, params.data.id));

  await checkAndGrantAchievements(userId, "first_comment");

  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  res.status(201).json(
    CreatePostCommentResponse.parse({
      id: comment.id,
      postId: comment.postId,
      authorHandle: author.anonymousHandle,
      avatarColor: author.avatarColor,
      content: comment.content,
      createdAt: comment.createdAt,
    }),
  );
});

router.post("/discuss/posts/:id/upvote", async (req, res): Promise<void> => {
  const params = ToggleDiscussPostUpvoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.appUser!.id;

  const [post] = await db
    .select()
    .from(discussPostsTable)
    .where(eq(discussPostsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const [existingUpvote] = await db
    .select()
    .from(postUpvotesTable)
    .where(and(eq(postUpvotesTable.postId, params.data.id), eq(postUpvotesTable.userId, userId)));

  if (existingUpvote) {
    await db.delete(postUpvotesTable).where(eq(postUpvotesTable.id, existingUpvote.id));
    await db
      .update(discussPostsTable)
      .set({ upvoteCount: Math.max(0, post.upvoteCount - 1) })
      .where(eq(discussPostsTable.id, params.data.id));
  } else {
    await db.insert(postUpvotesTable).values({ postId: params.data.id, userId });
    await db
      .update(discussPostsTable)
      .set({ upvoteCount: post.upvoteCount + 1 })
      .where(eq(discussPostsTable.id, params.data.id));
  }

  const serialized = await serializePost(params.data.id, userId);
  res.json(ToggleDiscussPostUpvoteResponse.parse(serialized));
});

export default router;
