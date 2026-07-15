---
name: DB migrations must be run manually
description: drizzle-kit push must be run explicitly; tables never auto-create
---

## Rule
After any schema change (new table, new column, altered type), run:
```bash
pnpm --filter @workspace/db push
# or, to bypass safety prompts:
pnpm --filter @workspace/db push-force
```

**Why:** The API server does NOT auto-migrate on startup. If tables are missing, `requireAuth` will fail with `relation "users" does not exist` and every authenticated route returns 500.

**How to apply:** Run this command immediately after adding/changing schema files in `lib/db/src/schema/`. Also run it in any post-merge setup script when schema files changed.
