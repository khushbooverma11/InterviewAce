import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

/**
 * Database connection.
 *
 * Priority:
 *   1. SUPABASE_DATABASE_URL  — Supabase (production target)
 *   2. DATABASE_URL            — Replit built-in PostgreSQL (fallback / local dev)
 *
 * To switch to Supabase: set SUPABASE_DATABASE_URL to the connection pooler
 * URI from Supabase → Settings → Database → Connection pooling (port 6543).
 * No code changes are needed.
 */
const connectionString = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

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
