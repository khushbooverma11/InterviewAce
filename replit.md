# InterviewAce

A technical interview prep platform: a mobile-first app where candidates practice DSA, study learning tracks, discuss with the community, and do live peer-to-peer voice + text sessions with other users — backed by a REST + WebSocket API with Clerk authentication and PostgreSQL.

## Run & Operate

- `pnpm install` — install all workspace dependencies (run once after cloning)
- `pnpm --filter @workspace/api-server run dev` — build + run the API server (port from `PORT` env)
- `pnpm --filter @workspace/interview-ace run dev` — run the Expo mobile/web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to PostgreSQL (dev only)
- `pnpm --filter @workspace/db run push-force` — force-push (destructive, dev only)

### Required secrets
| Secret | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk backend secret key |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend publishable key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same key, exposed to Vite/web builds |
| `SESSION_SECRET` | Express session signing secret |

### Optional secrets
| Secret | Description |
|---|---|
| `METERED_API_KEY` | Metered.ca API key — enables private dedicated TURN servers for production voice calls |
| `METERED_APP_NAME` | Your Metered.ca application name (required alongside `METERED_API_KEY`) |

## Stack

- **Monorepo**: pnpm workspaces, Node.js 24, TypeScript 5.9
- **API**: Express 5 + http.Server + ws (WebSocket) — `artifacts/api-server`
- **Mobile/Web**: React Native + Expo SDK 52, Expo Router — `artifacts/interview-ace`
- **DB**: PostgreSQL + Drizzle ORM — `lib/db`
- **Auth**: Clerk (`@clerk/express` on server, `@clerk/expo` on client)
- **Voice**: WebRTC — browser native on web, `react-native-webrtc` on native (custom build)
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (OpenAPI → TanStack Query hooks + Zod schemas) — `lib/api-spec`
- **Build**: esbuild (API bundle)

## Where things live

| Path | What it is |
|---|---|
| `artifacts/api-server/src/index.ts` | Express + WebSocket server entry point |
| `artifacts/api-server/src/routes/` | All API route handlers |
| `artifacts/api-server/src/ws-server.ts` | WebSocket signaling server for voice/chat |
| `artifacts/api-server/src/ws-tickets.ts` | One-time WS auth ticket store |
| `artifacts/interview-ace/app/` | Expo Router screens |
| `artifacts/interview-ace/app/(tabs)/` | Bottom tab screens (Home, Practice, Discuss, Profile) |
| `artifacts/interview-ace/app/discuss/chat/[id].tsx` | Live peer session screen |
| `artifacts/interview-ace/components/discuss/VoiceCallView.tsx` | WebRTC voice call component |
| `lib/db/src/schema/` | Drizzle ORM table definitions (source of truth for DB shape) |
| `lib/api-spec/openapi.yaml` | OpenAPI spec (source of truth for API contract) |
| `lib/api-spec/src/generated/` | Auto-generated API hooks + Zod schemas (do not edit manually) |

## Architecture decisions

- **WebSocket signaling primary, HTTP polling fallback**: WS reduces voice call setup from ~10 s to ~1 s. Signals are written to the DB so HTTP polling (3 s) can catch up if the WS connection drops. Signals are marked `consumed` immediately on WS delivery to prevent double-delivery.
- **Ticket-based WS auth**: Clerk JWTs cannot be sent in WS handshake headers from browsers. Instead, the client calls `GET /api/discuss/sessions/:id/ws-ticket` (authenticated) to get a 30-second one-time token, then opens `wss://…/api/ws?sessionId=:id&ticket=:token`.
- **OpenRelay TURN by default**: `GET /api/ice-servers` returns Metered.ca's public OpenRelay TURN servers (no credentials needed) so voice calls traverse NAT out of the box in dev. Set `METERED_API_KEY` + `METERED_APP_NAME` for private TURN in production.
- **react-native-webrtc loaded via require()**: The package is a native module and crashes Expo Go. `VoiceCallView.tsx` wraps the require in try/catch and renders a soft fallback when it fails, so the app stays functional in Expo Go.
- **JIT user provisioning**: `requireAuth` middleware creates a DB user row on first authenticated request, so no separate "register" step is needed beyond Clerk sign-up.

## Product

- **Practice**: Browse DSA patterns and coding questions; mark questions solved; track progress per pattern.
- **Learn**: Structured learning tracks with lessons and progress checkpoints.
- **Discuss (Community)**: Post questions, reply, upvote — community forum.
- **Discuss (Find Partner)**: Queue up for a live peer session filtered by topic, skill level, and duration; matched users get a shared voice + text session room.
- **Voice + Text Session**: WebRTC voice call with in-session text chat; post-call feedback and block/report flow.
- **Gamification**: Achievements unlocked on milestones; dashboard stats show streak, solved count, XP.
- **Profile**: View achievements, edit preferences, session history.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Always run `pnpm --filter @workspace/db run push` after any schema change** — tables do not auto-create on server start.
- **`react-native-webrtc` requires a custom Expo build** — voice calls work in the browser preview now; native iOS/Android voice needs EAS Build (`eas build`).
- **Never import `@clerk/expo` at module top-level on web** — gate with `AUTH_ENABLED` flag and use `require()` to prevent a native module crash.
- **API codegen is not automatic** — after editing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks/schemas.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
- See `.agents/memory/` for session-level architecture notes and quirks.
