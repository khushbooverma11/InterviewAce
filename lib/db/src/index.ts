import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

/**
 * Database connection.
 *
 * Priority:
 *   1. SUPABASE_POOLER_URL    — Supabase Transaction Pooler (port 6543, works from Replit)
 *   2. SUPABASE_DATABASE_URL  — Supabase direct connection (fallback)
 *   3. DATABASE_URL            — Replit built-in PostgreSQL (local dev fallback)
 *
 * SUPABASE_POOLER_URL must point to the Transaction Pooler endpoint
 * (aws-0-<region>.pooler.supabase.com:6543) which is reachable from Replit containers.
 * The direct connection host (db.<ref>.supabase.co:5432) is not resolvable from Replit.
 */
const connectionString =
  process.env.SUPABASE_POOLER_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "No database connection string found. Set SUPABASE_DATABASE_URL (Supabase) " +
    "or DATABASE_URL (Replit built-in PostgreSQL).",
  );
}

const isSupabase = Boolean(process.env.SUPABASE_DATABASE_URL);

export const pool = new Pool({
  connectionString,
  // Supabase requires SSL; Replit built-in PostgreSQL does not.
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
