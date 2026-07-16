import { pgTable, serial, integer, text, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const postTypeEnum = pgEnum("post_type", ["question", "discussion", "resource"]);

export const discussPostsTable = pgTable("discuss_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: postTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  topicTag: text("topic_tag"),
  upvoteCount: integer("upvote_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDiscussPostSchema = createInsertSchema(discussPostsTable).omit({ id: true, createdAt: true });
export type InsertDiscussPost = z.infer<typeof insertDiscussPostSchema>;
export type DiscussPost = typeof discussPostsTable.$inferSelect;
