-- ============================================================
-- InterviewAce — Data Migration
-- Phase 3: Migrate existing rows from Replit DB → Supabase
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
--   Run this AFTER 01_schema.sql succeeds.
--
-- Row counts from Replit DB at time of export:
--   users         : 1 row
--   user_stats    : 1 row
--   match_requests: 2 rows (both cancelled — safe to skip)
--   all other tables: 0 rows
-- ============================================================

-- ── users ─────────────────────────────────────────────────────────────────────
INSERT INTO users (id, clerk_user_id, display_name, anonymous_handle, avatar_color, target_companies, is_seed, created_at)
VALUES (2, 'user_3GaUc4hVHPz4xla1fjAK9DfABfL', 'Explorer', 'SwiftRaven358', '#7c6cff', '[]'::jsonb, false, '2026-07-16T13:40:52.764Z');

-- ── user_stats ────────────────────────────────────────────────────────────────
INSERT INTO user_stats (id, user_id, xp, level, streak_count, longest_streak, last_active_date, total_topics_completed, total_problems_solved)
VALUES (1, 2, 0, 1, 0, 0, NULL, 0, 0);

-- ── match_requests ────────────────────────────────────────────────────────────
-- Both rows are status=cancelled from testing. Skipped intentionally.
-- If you want to include them anyway, uncomment below:
--
-- INSERT INTO match_requests (id, user_id, topic, skill_level, chat_type, duration_minutes, language, status, session_id, created_at)
-- VALUES
--   (1, 2, 'Arrays & Hashing', 'intermediate', 'voice', 30, NULL, 'cancelled', NULL, '2026-07-16T13:40:58.027Z'),
--   (2, 2, 'Arrays & Hashing', 'intermediate', 'voice', 30, NULL, 'cancelled', NULL, '2026-07-17T09:19:57.558Z');

-- ── Reset sequences so new inserts don't collide with migrated IDs ────────────
SELECT setval('users_id_seq',        (SELECT COALESCE(MAX(id), 1) FROM users),        true);
SELECT setval('user_stats_id_seq',   (SELECT COALESCE(MAX(id), 1) FROM user_stats),   true);
SELECT setval('match_requests_id_seq',(SELECT COALESCE(MAX(id), 1) FROM match_requests),true);
