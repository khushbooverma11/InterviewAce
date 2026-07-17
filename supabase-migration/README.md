# InterviewAce — Supabase Migration Guide

## Overview

This directory contains everything needed to migrate from Replit's built-in PostgreSQL to your Supabase project.

## Files

| File | Purpose |
|---|---|
| `01_schema.sql` | Creates all 23 tables, 13 enums, and 38 foreign keys |
| `02_data.sql` | Migrates the 2 existing rows of user data |
| `03_verify.sql` | Verification queries — run after migration |

---

## Step-by-step

### Phase 2 — Apply schema to Supabase

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (`owkhzcgnrvfljsbzykqf`)
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Paste the entire contents of `supabase-migration/01_schema.sql`
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned."

### Phase 3 — Migrate data

1. In the SQL Editor, open a **New query**
2. Paste the entire contents of `supabase-migration/02_data.sql`
3. Click **Run**

### Phase 4 — Connect the app to Supabase

The app code already prefers `SUPABASE_DATABASE_URL` over `DATABASE_URL`
(as of the changes made in this migration). You need to update the secret
with the **connection pooler** URL (not the direct DB URL):

1. Supabase dashboard → Settings → Database
2. Scroll to **Connection pooling**
3. Select **Transaction** mode (recommended) or Session mode
4. Copy the **URI** — it looks like:
   ```
   postgresql://postgres.owkhzcgnrvfljsbzykqf:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
   ```
5. In Replit: Secrets → `SUPABASE_DATABASE_URL` → update with the pooler URI
6. Restart the API server

### Phase 5 — Verify

1. In the SQL Editor, open a **New query**
2. Paste `supabase-migration/03_verify.sql` and run it
3. Confirm:
   - `users` shows 1 row
   - `user_stats` shows 1 row
   - All 13 enums are listed with correct values
   - All foreign keys are present
4. Test the app features end-to-end

---

## Rollback

If anything goes wrong, the Replit built-in database is untouched.
Remove `SUPABASE_DATABASE_URL` from Replit Secrets and the app
automatically falls back to the Replit DB.

```
Replit Secrets → SUPABASE_DATABASE_URL → Delete
```

The Replit DB data was never modified or deleted during this migration.
