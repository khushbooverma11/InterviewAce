import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { chatSessionsTable } from "./chatSessions";
import { usersTable } from "./users";

export const sessionFeedbackTable = pgTable(
  "session_feedback",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => chatSessionsTable.id, { onDelete: "cascade" }),
    raterId: integer("rater_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    rateeId: integer("ratee_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    /** Overall 1–5 star rating. */
    overallRating: integer("overall_rating").notNull(),
    /** 1–5: how clearly the partner communicated. */
    communication: integer("communication"),
    /** 1–5: how helpful they were. */
    helpfulness: integer("helpfulness"),
    /** 1–5: depth of their technical knowledge. */
    knowledge: integer("knowledge"),
    comments: text("comments"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("session_feedback_rater_unique").on(t.sessionId, t.raterId)],
);

export const insertSessionFeedbackSchema = createInsertSchema(sessionFeedbackTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSessionFeedback = z.infer<typeof insertSessionFeedbackSchema>;
export type SessionFeedback = typeof sessionFeedbackTable.$inferSelect;
