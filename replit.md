# InterviewAce

A technical interview prep platform: mobile app for candidates to practice coding and behavioral questions, backed by a REST API with gamification and Clerk authentication.

## Run & Operate

- `pnpm install` — install all workspace dependencies (run first after cloning)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/interview-ace run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

### Required secrets
- `DATABASE_URL` — PostgreSQL connection string
- `CLERK_SECRET_KEY` — Clerk backend secret key
- `CLERK_PUBLISHABLE_KEY` — Clerk frontend publishable key (also used as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in mobile)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (`artifacts/api-server`)
- Mobile: React Native + Expo (`artifacts/interview-ace`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Auth: Clerk
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec`)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
