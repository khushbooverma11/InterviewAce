import { pgTable, serial, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { discussPostsTable } from "./discussPosts";
import { usersTable } from "./users";

export const postUpvotesTable = pgTable("post_upvotes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => discussPostsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
}, (t) => [
  unique("post_upvotes_post_user_unique").on(t.postId, t.userId),
]);

export const insertPostUpvoteSchema = createInsertSchema(postUpvotesTable).omit({ id: true });
export type InsertPostUpvote = z.infer<typeof insertPostUpvoteSchema>;
export type PostUpvote = typeof postUpvotesTable.$inferSelect;
