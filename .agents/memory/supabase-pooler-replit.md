---
name: Supabase pooler required on Replit
description: Replit containers cannot resolve the Supabase direct connection host; the Transaction Pooler must be used instead.
---

## Rule
Never use the Supabase **direct connection** URL (`db.<ref>.supabase.co:5432`) in Replit.
Always use the **Transaction Pooler** URL (`aws-0-<region>.pooler.supabase.com:6543`).

**Why:** The direct host is not DNS-resolvable from Replit's container network (ENOTFOUND). The pooler endpoints resolve fine and accept connections.

## How to apply
- Store the pooler URL as `SUPABASE_POOLER_URL` env var (non-secret is fine — it contains only the password, which is already in the secret).
- `lib/db/src/index.ts` already reads `SUPABASE_POOLER_URL` first, then falls back to `SUPABASE_DATABASE_URL`, then `DATABASE_URL`.
- Pooler user format: `postgres.<project-ref>` (not just `postgres`).
- Region for this project: `ap-northeast-1`.
- Password format in URL: URL-encode `@` as `%40` (e.g., `CoTechies%40654` for password `CoTechies@654`).
- SSL: `rejectUnauthorized: false` (already set in `lib/db/src/index.ts` when `SUPABASE_DATABASE_URL` or `SUPABASE_POOLER_URL` is set).

## Discovery method
TCP probe all regions → all resolve. PG connection probe → `ap-northeast-1` returned "password authentication failed" (tenant found) while others returned "tenant not found" → confirmed region. Real password had URL-encoded `@` (`%40`) that needed decoding.
