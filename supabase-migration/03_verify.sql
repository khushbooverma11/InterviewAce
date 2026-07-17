-- ============================================================
-- InterviewAce — Verification Queries
-- Phase 5: Run after schema + data migration to confirm everything is correct
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ── Row counts ────────────────────────────────────────────────────────────────
SELECT 'users'             AS table_name, COUNT(*) AS rows FROM users
UNION ALL SELECT 'user_stats',           COUNT(*) FROM user_stats
UNION ALL SELECT 'topics',               COUNT(*) FROM topics
UNION ALL SELECT 'topic_steps',          COUNT(*) FROM topic_steps
UNION ALL SELECT 'topic_progress',       COUNT(*) FROM topic_progress
UNION ALL SELECT 'dsa_patterns',         COUNT(*) FROM dsa_patterns
UNION ALL SELECT 'pattern_questions',    COUNT(*) FROM pattern_questions
UNION ALL SELECT 'pattern_progress',     COUNT(*) FROM pattern_progress
UNION ALL SELECT 'achievements',         COUNT(*) FROM achievements
UNION ALL SELECT 'user_achievements',    COUNT(*) FROM user_achievements
UNION ALL SELECT 'discuss_posts',        COUNT(*) FROM discuss_posts
UNION ALL SELECT 'post_comments',        COUNT(*) FROM post_comments
UNION ALL SELECT 'post_upvotes',         COUNT(*) FROM post_upvotes
UNION ALL SELECT 'chat_sessions',        COUNT(*) FROM chat_sessions
UNION ALL SELECT 'chat_messages',        COUNT(*) FROM chat_messages
UNION ALL SELECT 'match_requests',       COUNT(*) FROM match_requests
UNION ALL SELECT 'friendships',          COUNT(*) FROM friendships
UNION ALL SELECT 'direct_messages',      COUNT(*) FROM direct_messages
UNION ALL SELECT 'webrtc_signals',       COUNT(*) FROM webrtc_signals
UNION ALL SELECT 'notifications',        COUNT(*) FROM notifications
UNION ALL SELECT 'session_feedback',     COUNT(*) FROM session_feedback
UNION ALL SELECT 'session_reports',      COUNT(*) FROM session_reports
UNION ALL SELECT 'user_blocks',          COUNT(*) FROM user_blocks
ORDER BY table_name;

-- ── Enum verification ─────────────────────────────────────────────────────────
SELECT typname AS enum_name, array_agg(enumlabel ORDER BY enumsortorder) AS values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN (
  'topic_difficulty','step_type','question_difficulty','post_type',
  'chat_type','session_status','match_status','skill_level',
  'message_type','report_reason','friendship_status','dm_type','notification_type'
)
GROUP BY typname
ORDER BY typname;

-- ── Foreign key integrity ─────────────────────────────────────────────────────
SELECT conrelid::regclass AS table_name, conname AS constraint_name
FROM pg_constraint
WHERE contype = 'f'
ORDER BY table_name, conname;

-- ── Sequence values ───────────────────────────────────────────────────────────
SELECT sequence_name, last_value
FROM information_schema.sequences
JOIN pg_sequences ON sequencename = sequence_name
WHERE sequence_schema = 'public'
ORDER BY sequence_name;
