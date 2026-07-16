# InterviewAce

A full-stack technical interview prep platform. Practice DSA problems, follow structured learning tracks, discuss with the community, and do **live peer-to-peer voice + text sessions** with other users — all in one mobile/web app.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Running on Replit](#running-on-replit)
5. [Running Locally](#running-locally)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Project Structure](#project-structure)
9. [API Overview](#api-overview)
10. [Voice Calls (WebRTC)](#voice-calls-webrtc)
11. [Building for Native (iOS / Android)](#building-for-native-ios--android)

---

## Features

| Feature | Description |
|---|---|
| **Practice** | Browse DSA patterns and questions; mark solved; track progress |
| **Learn** | Structured learning tracks with lessons and checkpoints |
| **Community** | Post questions, reply, upvote — forum-style |
| **Find Partner** | Queue for a live peer session filtered by topic, skill, and duration |
| **Voice + Text Session** | Real-time WebRTC voice call with in-session text chat |
| **Gamification** | Achievements, XP, streaks, and a personal dashboard |
| **Profile** | Achievement history, session stats, preferences |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Language | TypeScript 5.9, Node.js 24 |
| Mobile / Web | React Native + Expo SDK 52, Expo Router |
| API Server | Express 5, WebSocket (`ws`) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Clerk (`@clerk/express` + `@clerk/expo`) |
| Voice | WebRTC (browser native on web · `react-native-webrtc` on native) |
| Data fetching | TanStack Query (auto-generated from OpenAPI spec via Orval) |
| Validation | Zod + `drizzle-zod` |
| Build | esbuild (API) |

---

## Prerequisites

- **Node.js 24+** and **pnpm 9+**
- **PostgreSQL** database (or a hosted instance — Replit provides one automatically)
- **Clerk account** — [clerk.com](https://clerk.com) (free tier works)

---

## Running on Replit

Replit handles environment variables, the database, and workflow management automatically.

### Step 1 — Fork / import the repl

Open the project in Replit. The three workflows are pre-configured:

| Workflow | Command |
|---|---|
| API Server | `pnpm --filter @workspace/api-server run dev` |
| Expo App | `pnpm --filter @workspace/interview-ace run dev` |
| Canvas (mockup sandbox) | `pnpm --filter @workspace/mockup-sandbox run dev` |

### Step 2 — Set secrets

In the Replit **Secrets** panel (🔒 icon), add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string (Replit auto-sets this if you provision a Replit DB) |
| `CLERK_SECRET_KEY` | From your Clerk dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | From your Clerk dashboard → API Keys |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same value as `CLERK_PUBLISHABLE_KEY` |
| `SESSION_SECRET` | Any long random string (e.g. 64 random hex chars) |

### Step 3 — Push the database schema

Open the Replit **Shell** tab and run:

```bash
pnpm --filter @workspace/db run push
```

This creates all tables. Run this once after setup, and again any time you change the schema.

### Step 4 — Seed the database (optional but recommended)

```bash
pnpm --filter @workspace/db run seed
```

This populates topics, DSA patterns, achievements, and sample community posts.

### Step 5 — Start the workflows

Click **Run** or start each workflow from the Replit workflow panel. The app is now live in the preview pane.

---

## Running Locally

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables — see [Environment Variables](#environment-variables) below.

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Seed (optional)

```bash
pnpm --filter @workspace/db run seed
```

### 5. Start the API server

```bash
pnpm --filter @workspace/api-server run dev
```

The server starts on the port defined by the `PORT` environment variable (default `8080`).

### 6. Start the Expo app

```bash
pnpm --filter @workspace/interview-ace run dev
```

Then press:
- **`w`** — open in browser
- **`i`** — open in iOS Simulator (requires Xcode)
- **`a`** — open in Android emulator

---

## Environment Variables

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string — e.g. `postgresql://user:pass@host:5432/dbname` |
| `CLERK_SECRET_KEY` | Clerk backend secret (starts with `sk_`) |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (starts with `pk_`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same as `CLERK_PUBLISHABLE_KEY` — exposed to Vite/web builds |
| `SESSION_SECRET` | Long random string used to sign Express sessions |

### Optional

| Variable | Description |
|---|---|
| `METERED_API_KEY` | Metered.ca API key for private dedicated TURN servers (production voice calls) |
| `METERED_APP_NAME` | Your Metered.ca application name (required alongside `METERED_API_KEY`) |
| `PORT` | Port the API server listens on (default `8080`) |

> **No TURN credentials?** The app works out of the box using Metered.ca's public OpenRelay TURN servers — no signup required. Set `METERED_API_KEY` + `METERED_APP_NAME` only when you need private/dedicated TURN for production.

---

## Database Setup

The database schema lives in `lib/db/src/schema/`. After any schema change:

```bash
# Apply changes (safe — does not drop data)
pnpm --filter @workspace/db run push

# Force-apply (destructive — drops and recreates tables)
pnpm --filter @workspace/db run push-force
```

> ⚠️ Tables are **not** auto-created on server start. You must run `push` manually.

---

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express + WebSocket backend
│   │   └── src/
│   │       ├── index.ts     # Server entry point
│   │       ├── routes/      # Route handlers (topics, discuss, sessions, ice, …)
│   │       ├── ws-server.ts # WebSocket signaling server
│   │       └── ws-tickets.ts# One-time WS auth ticket store
│   ├── interview-ace/       # Expo React Native app
│   │   └── app/
│   │       ├── (auth)/      # Sign-in and sign-up screens
│   │       ├── (tabs)/      # Bottom tabs: Home, Practice, Discuss, Profile
│   │       ├── learn/       # Learning track + lesson screens
│   │       └── discuss/
│   │           └── chat/    # Live peer session screen
│   └── mockup-sandbox/      # UI component playground (Canvas)
├── lib/
│   ├── db/                  # Drizzle ORM schema + migrations
│   │   └── src/schema/      # Table definitions (source of truth)
│   └── api-spec/            # OpenAPI spec + auto-generated hooks
│       ├── openapi.yaml     # API contract (source of truth)
│       └── src/generated/   # Auto-generated — do not edit manually
└── pnpm-workspace.yaml
```

---

## API Overview

All routes are prefixed with `/api`.

| Route | Description |
|---|---|
| `GET /healthz` | Health check |
| `GET /me` | Current user profile + stats |
| `GET /topics` | List DSA topics |
| `GET /patterns` | List DSA patterns |
| `GET /discuss/posts` | Community forum posts |
| `POST /discuss/match` | Queue for a peer session |
| `GET /discuss/match/status` | Poll match status |
| `GET /discuss/sessions/:id` | Get session details |
| `POST /discuss/sessions/:id/signals` | Push WebRTC signal (HTTP fallback) |
| `GET /discuss/sessions/:id/signals` | Poll WebRTC signals (HTTP fallback) |
| `GET /discuss/sessions/:id/ws-ticket` | Get a one-time WebSocket auth ticket |
| `GET /ice-servers` | STUN/TURN server list for WebRTC |
| `GET /achievements` | List achievements + claim status |

**WebSocket**: connect to `wss://<host>/api/ws?sessionId=<id>&ticket=<token>` for real-time signaling.

---

## Voice Calls (WebRTC)

Voice calls use WebRTC with a two-tier signaling approach:

1. **WebSocket (primary)** — ~1 second call setup. Client gets a one-time ticket from `/api/discuss/sessions/:id/ws-ticket`, opens a WS connection, and exchanges offer/answer/ICE candidates in real time.
2. **HTTP polling (fallback)** — polls every 3 seconds if WS is unavailable.

ICE servers are fetched from `/api/ice-servers` on each call setup. By default the response includes:
- Google STUN servers
- Metered.ca OpenRelay **TURN** servers (public, no credentials needed — suitable for development)

For production, set `METERED_API_KEY` + `METERED_APP_NAME` to get private TURN credentials automatically injected per request.

---

## Building for Native (iOS / Android)

Voice calls and some features require a **custom Expo build** — they do not work in Expo Go because `react-native-webrtc` is a native module.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure the build (first time only)
eas build:configure

# Build for iOS (simulator)
eas build --platform ios --profile development

# Build for Android
eas build --platform android --profile development
```

The app works fully in the **browser** (web) without any native build — start there for development.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Make changes — keep schema changes in `lib/db/src/schema/`.
3. Run `pnpm run typecheck` before committing.
4. After schema changes, run `pnpm --filter @workspace/db run push`.
5. After OpenAPI spec changes, run `pnpm --filter @workspace/api-spec run codegen`.
