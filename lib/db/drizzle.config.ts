import { defineConfig } from "drizzle-kit";
import path from "path";

// Prefer SUPABASE_POOLER_URL (Transaction Pooler, port 6543 — reachable from Replit),
// then SUPABASE_DATABASE_URL (direct, port 5432 — not reachable from Replit containers),
// then Replit built-in DATABASE_URL.
const url =
  process.env.SUPABASE_POOLER_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "No database URL found. Set SUPABASE_DATABASE_URL or DATABASE_URL.",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url,
    ssl: process.env.SUPABASE_DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  },
});
