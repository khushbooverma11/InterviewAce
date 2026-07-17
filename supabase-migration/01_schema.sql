-- ============================================================
-- InterviewAce — Supabase Schema Migration
-- Phase 2: Create all tables, enums, constraints, foreign keys
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "public"."topic_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');
CREATE TYPE "public"."step_type" AS ENUM('introduction', 'real_life_example', 'core_concepts', 'industry_usage', 'revision_notes', 'interview_questions', 'common_mistakes', 'revision_card');
CREATE TYPE "public"."question_difficulty" AS ENUM('easy', 'medium', 'hard');
CREATE TYPE "public"."post_type" AS ENUM('question', 'discussion', 'resource');
CREATE TYPE "public"."chat_type" AS ENUM('text', 'voice');
CREATE TYPE "public"."session_status" AS ENUM('active', 'ended');
CREATE TYPE "public"."match_status" AS ENUM('waiting', 'matched', 'cancelled', 'expired');
CREATE TYPE "public"."skill_level" AS ENUM('beginner', 'intermediate', 'advanced', 'any');
CREATE TYPE "public"."message_type" AS ENUM('text', 'code', 'system');
CREATE TYPE "public"."report_reason" AS ENUM('spam', 'harassment', 'inappropriate', 'off_topic', 'other');
CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'rejected');
CREATE TYPE "public"."dm_type" AS ENUM('text', 'code');
CREATE TYPE "public"."notification_type" AS ENUM('friend_request', 'friend_accepted', 'new_message', 'incoming_call', 'session_ended', 'feedback_received');

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "clerk_user_id" text,
  "display_name" text DEFAULT 'Explorer' NOT NULL,
  "anonymous_handle" text NOT NULL,
  "avatar_color" text NOT NULL,
  "target_companies" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_seed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
  CONSTRAINT "users_anonymous_handle_unique" UNIQUE("anonymous_handle")
);

CREATE TABLE "user_stats" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "xp" integer DEFAULT 0 NOT NULL,
  "level" integer DEFAULT 1 NOT NULL,
  "streak_count" integer DEFAULT 0 NOT NULL,
  "longest_streak" integer DEFAULT 0 NOT NULL,
  "last_active_date" date,
  "total_topics_completed" integer DEFAULT 0 NOT NULL,
  "total_problems_solved" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE "topics" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "order" integer NOT NULL,
  "icon_name" text NOT NULL,
  "difficulty" "topic_difficulty" NOT NULL,
  "estimated_minutes" integer NOT NULL,
  CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);

CREATE TABLE "topic_steps" (
  "id" serial PRIMARY KEY NOT NULL,
  "topic_id" integer NOT NULL,
  "step_number" integer NOT NULL,
  "step_type" "step_type" NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL
);

CREATE TABLE "topic_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "topic_id" integer NOT NULL,
  "completed_step_numbers" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "current_step" integer DEFAULT 1 NOT NULL,
  "is_completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamp with time zone,
  CONSTRAINT "topic_progress_user_topic_unique" UNIQUE("user_id","topic_id")
);

CREATE TABLE "dsa_patterns" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "recognition_clues" text NOT NULL,
  "time_complexity" text NOT NULL,
  "space_complexity" text NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  CONSTRAINT "dsa_patterns_slug_unique" UNIQUE("slug")
);

CREATE TABLE "pattern_questions" (
  "id" serial PRIMARY KEY NOT NULL,
  "pattern_id" integer NOT NULL,
  "title" text NOT NULL,
  "difficulty" "question_difficulty" NOT NULL,
  "description" text NOT NULL,
  "hint" text NOT NULL
);

CREATE TABLE "pattern_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "pattern_id" integer NOT NULL,
  "questions_attempted" integer DEFAULT 0 NOT NULL,
  "questions_solved" integer DEFAULT 0 NOT NULL,
  "solved_question_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  CONSTRAINT "pattern_progress_user_pattern_unique" UNIQUE("user_id","pattern_id")
);

CREATE TABLE "discuss_posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "author_id" integer NOT NULL,
  "type" "post_type" NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "topic_tag" text,
  "upvote_count" integer DEFAULT 0 NOT NULL,
  "comment_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "post_upvotes" (
  "id" serial PRIMARY KEY NOT NULL,
  "post_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  CONSTRAINT "post_upvotes_post_user_unique" UNIQUE("post_id","user_id")
);

CREATE TABLE "post_comments" (
  "id" serial PRIMARY KEY NOT NULL,
  "post_id" integer NOT NULL,
  "author_id" integer NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "chat_sessions" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_a_id" integer NOT NULL,
  "user_b_id" integer NOT NULL,
  "topic" text NOT NULL,
  "chat_type" "chat_type" NOT NULL,
  "duration_minutes" integer NOT NULL,
  "status" "session_status" DEFAULT 'active' NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ended_at" timestamp with time zone
);

CREATE TABLE "match_requests" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "topic" text NOT NULL,
  "skill_level" "skill_level" NOT NULL,
  "chat_type" text NOT NULL,
  "duration_minutes" integer NOT NULL,
  "language" text,
  "status" "match_status" DEFAULT 'waiting' NOT NULL,
  "session_id" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "chat_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" integer NOT NULL,
  "sender_id" integer NOT NULL,
  "type" "message_type" NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "session_reports" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" integer NOT NULL,
  "reporter_id" integer NOT NULL,
  "reported_user_id" integer NOT NULL,
  "reason" "report_reason" NOT NULL,
  "details" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_blocks" (
  "id" serial PRIMARY KEY NOT NULL,
  "blocker_id" integer NOT NULL,
  "blocked_id" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_blocks_blocker_blocked_unique" UNIQUE("blocker_id","blocked_id")
);

CREATE TABLE "achievements" (
  "id" serial PRIMARY KEY NOT NULL,
  "code" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "icon_name" text NOT NULL,
  CONSTRAINT "achievements_code_unique" UNIQUE("code")
);

CREATE TABLE "user_achievements" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "achievement_id" integer NOT NULL,
  "earned_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_achievements_user_achievement_unique" UNIQUE("user_id","achievement_id")
);

CREATE TABLE "webrtc_signals" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" integer NOT NULL,
  "sender_id" integer NOT NULL,
  "recipient_id" integer NOT NULL,
  "type" text NOT NULL,
  "payload" text NOT NULL,
  "consumed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "friendships" (
  "id" serial PRIMARY KEY NOT NULL,
  "requester_id" integer NOT NULL,
  "recipient_id" integer NOT NULL,
  "status" "friendship_status" DEFAULT 'pending' NOT NULL,
  "session_id" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "friendships_pair_unique" UNIQUE("requester_id","recipient_id")
);

CREATE TABLE "direct_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "sender_id" integer NOT NULL,
  "recipient_id" integer NOT NULL,
  "content" text NOT NULL,
  "type" "dm_type" DEFAULT 'text' NOT NULL,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "type" "notification_type" NOT NULL,
  "from_user_id" integer,
  "ref_id" integer,
  "ref_type" text,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "session_feedback" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" integer NOT NULL,
  "rater_id" integer NOT NULL,
  "ratee_id" integer NOT NULL,
  "overall_rating" integer NOT NULL,
  "communication" integer,
  "helpfulness" integer,
  "knowledge" integer,
  "comments" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "session_feedback_rater_unique" UNIQUE("session_id","rater_id")
);

-- ── Foreign Keys ──────────────────────────────────────────────────────────────

ALTER TABLE "user_stats"        ADD CONSTRAINT "user_stats_user_id_users_id_fk"                     FOREIGN KEY ("user_id")          REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "topic_steps"       ADD CONSTRAINT "topic_steps_topic_id_topics_id_fk"                  FOREIGN KEY ("topic_id")         REFERENCES "topics"("id")        ON DELETE cascade;
ALTER TABLE "topic_progress"    ADD CONSTRAINT "topic_progress_user_id_users_id_fk"                 FOREIGN KEY ("user_id")          REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "topic_progress"    ADD CONSTRAINT "topic_progress_topic_id_topics_id_fk"               FOREIGN KEY ("topic_id")         REFERENCES "topics"("id")        ON DELETE cascade;
ALTER TABLE "pattern_questions" ADD CONSTRAINT "pattern_questions_pattern_id_dsa_patterns_id_fk"    FOREIGN KEY ("pattern_id")       REFERENCES "dsa_patterns"("id") ON DELETE cascade;
ALTER TABLE "pattern_progress"  ADD CONSTRAINT "pattern_progress_user_id_users_id_fk"               FOREIGN KEY ("user_id")          REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "pattern_progress"  ADD CONSTRAINT "pattern_progress_pattern_id_dsa_patterns_id_fk"     FOREIGN KEY ("pattern_id")       REFERENCES "dsa_patterns"("id") ON DELETE cascade;
ALTER TABLE "discuss_posts"     ADD CONSTRAINT "discuss_posts_author_id_users_id_fk"                FOREIGN KEY ("author_id")        REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "post_upvotes"      ADD CONSTRAINT "post_upvotes_post_id_discuss_posts_id_fk"           FOREIGN KEY ("post_id")          REFERENCES "discuss_posts"("id") ON DELETE cascade;
ALTER TABLE "post_upvotes"      ADD CONSTRAINT "post_upvotes_user_id_users_id_fk"                   FOREIGN KEY ("user_id")          REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "post_comments"     ADD CONSTRAINT "post_comments_post_id_discuss_posts_id_fk"          FOREIGN KEY ("post_id")          REFERENCES "discuss_posts"("id") ON DELETE cascade;
ALTER TABLE "post_comments"     ADD CONSTRAINT "post_comments_author_id_users_id_fk"                FOREIGN KEY ("author_id")        REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "chat_sessions"     ADD CONSTRAINT "chat_sessions_user_a_id_users_id_fk"                FOREIGN KEY ("user_a_id")        REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "chat_sessions"     ADD CONSTRAINT "chat_sessions_user_b_id_users_id_fk"                FOREIGN KEY ("user_b_id")        REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "match_requests"    ADD CONSTRAINT "match_requests_user_id_users_id_fk"                 FOREIGN KEY ("user_id")          REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "match_requests"    ADD CONSTRAINT "match_requests_session_id_chat_sessions_id_fk"      FOREIGN KEY ("session_id")       REFERENCES "chat_sessions"("id");
ALTER TABLE "chat_messages"     ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk"       FOREIGN KEY ("session_id")       REFERENCES "chat_sessions"("id") ON DELETE cascade;
ALTER TABLE "chat_messages"     ADD CONSTRAINT "chat_messages_sender_id_users_id_fk"                FOREIGN KEY ("sender_id")        REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "session_reports"   ADD CONSTRAINT "session_reports_session_id_chat_sessions_id_fk"     FOREIGN KEY ("session_id")       REFERENCES "chat_sessions"("id") ON DELETE cascade;
ALTER TABLE "session_reports"   ADD CONSTRAINT "session_reports_reporter_id_users_id_fk"            FOREIGN KEY ("reporter_id")      REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "session_reports"   ADD CONSTRAINT "session_reports_reported_user_id_users_id_fk"       FOREIGN KEY ("reported_user_id") REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "user_blocks"       ADD CONSTRAINT "user_blocks_blocker_id_users_id_fk"                 FOREIGN KEY ("blocker_id")       REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "user_blocks"       ADD CONSTRAINT "user_blocks_blocked_id_users_id_fk"                 FOREIGN KEY ("blocked_id")       REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk"              FOREIGN KEY ("user_id")          REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id")  REFERENCES "achievements"("id")  ON DELETE cascade;
ALTER TABLE "webrtc_signals"    ADD CONSTRAINT "webrtc_signals_session_id_chat_sessions_id_fk"      FOREIGN KEY ("session_id")       REFERENCES "chat_sessions"("id") ON DELETE cascade;
ALTER TABLE "webrtc_signals"    ADD CONSTRAINT "webrtc_signals_sender_id_users_id_fk"               FOREIGN KEY ("sender_id")        REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "webrtc_signals"    ADD CONSTRAINT "webrtc_signals_recipient_id_users_id_fk"            FOREIGN KEY ("recipient_id")     REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "friendships"       ADD CONSTRAINT "friendships_requester_id_users_id_fk"               FOREIGN KEY ("requester_id")     REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "friendships"       ADD CONSTRAINT "friendships_recipient_id_users_id_fk"               FOREIGN KEY ("recipient_id")     REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "friendships"       ADD CONSTRAINT "friendships_session_id_chat_sessions_id_fk"         FOREIGN KEY ("session_id")       REFERENCES "chat_sessions"("id") ON DELETE set null;
ALTER TABLE "direct_messages"   ADD CONSTRAINT "direct_messages_sender_id_users_id_fk"              FOREIGN KEY ("sender_id")        REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "direct_messages"   ADD CONSTRAINT "direct_messages_recipient_id_users_id_fk"           FOREIGN KEY ("recipient_id")     REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "notifications"     ADD CONSTRAINT "notifications_user_id_users_id_fk"                  FOREIGN KEY ("user_id")          REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "notifications"     ADD CONSTRAINT "notifications_from_user_id_users_id_fk"             FOREIGN KEY ("from_user_id")     REFERENCES "users"("id")         ON DELETE set null;
ALTER TABLE "session_feedback"  ADD CONSTRAINT "session_feedback_session_id_chat_sessions_id_fk"    FOREIGN KEY ("session_id")       REFERENCES "chat_sessions"("id") ON DELETE cascade;
ALTER TABLE "session_feedback"  ADD CONSTRAINT "session_feedback_rater_id_users_id_fk"              FOREIGN KEY ("rater_id")         REFERENCES "users"("id")         ON DELETE cascade;
ALTER TABLE "session_feedback"  ADD CONSTRAINT "session_feedback_ratee_id_users_id_fk"              FOREIGN KEY ("ratee_id")         REFERENCES "users"("id")         ON DELETE cascade;
