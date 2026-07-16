import { pgTable, serial, integer, text, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { chatSessionsTable } from "./chatSessions";
import { usersTable } from "./users";

export const reportReasonEnum = pgEnum("report_reason", ["spam", "harassment", "inappropriate", "off_topic", "other"]);

export const sessionReportsTable = pgTable("session_reports", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessionsTable.id, { onDelete: "cascade" }),
  reporterId: integer("reporter_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  reportedUserId: integer("reported_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  reason: reportReasonEnum("reason").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSessionReportSchema = createInsertSchema(sessionReportsTable).omit({ id: true, createdAt: true });
export type InsertSessionReport = z.infer<typeof insertSessionReportSchema>;
export type SessionReport = typeof sessionReportsTable.$inferSelect;
