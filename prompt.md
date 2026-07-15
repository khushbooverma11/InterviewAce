# InterviewAce – App Prompt

## Overview

InterviewAce is a mobile-first interview preparation app built with Expo (React Native) and a Node/Express API server. It helps software engineering candidates prepare for technical interviews through structured learning, peer discussion, and anonymous co-learner matching.

## Tech Stack

- **Frontend**: Expo (React Native) with Expo Router (file-based navigation)
- **Backend**: Express.js API server with Drizzle ORM + PostgreSQL
- **Auth**: Clerk (email/password; Core v3 SDK via `@clerk/expo`)
- **Data fetching**: TanStack React Query with a generated Orval API client
- **Monorepo**: pnpm workspace with shared packages (`lib/db`, `lib/api-client-react`, `lib/api-zod`, `lib/api-spec`)
- **Language**: TypeScript throughout

## Features

### 1. Topics & Patterns (Learning)
Users browse curated DSA patterns (Two Pointers, Sliding Window, etc.) grouped by topic. Each pattern has steps (read → practice → review). Progress is tracked per-user.

### 2. Discuss (Community)
- **Community Feed**: Users create posts tagged as `question`, `discussion`, or `resource`. Posts can be filtered by topic tag. Each post has upvotes and comments.
- **Study Partners**: Anonymous co-learner matching. Users pick a topic, skill level, session duration, and chat type (voice/text). The system matches them in real-time. Once matched, they enter a text chat session with 3s polling.
- **Moderation**: Users can report or block others from within a chat session.
- All usernames are auto-generated anonymous handles (e.g. `QuietFalcon342`) so identity is never exposed.

### 3. Profile & Achievements
Users have a profile with their target companies, streak, XP, and earned achievement badges. Achievements are granted automatically by the API on key actions (first post, first comment, etc.).

## App Structure

```
artifacts/
  interview-ace/         # Expo mobile app
    app/
      _layout.tsx        # Root: ClerkProvider, QueryClientProvider, fonts
      (auth)/
        _layout.tsx      # Redirects signed-in users to tabs
        sign-in.tsx      # Email + password sign-in
        sign-up.tsx      # Email + password sign-up + email verification
      (tabs)/
        _layout.tsx      # Tab bar (auth guard + Clerk token getter on native)
        index.tsx        # Home screen
        discuss.tsx      # Discuss hub (community feed + partner tab)
        explore.tsx      # Topic browser
        profile.tsx      # User profile + achievements
      discuss/
        [id].tsx         # Post detail + comments
        new-post.tsx     # Create post modal
        find-partner.tsx # Match flow (configure → searching → matched)
        chat/
          [id].tsx       # Chat session screen
    components/
      discuss/           # Shared Discuss UI components
        AvatarBadge.tsx
        TopicChip.tsx
        PostCard.tsx
        MessageBubble.tsx
    hooks/
      useColors.ts       # Design token hook
    constants/
      colors.ts          # Color tokens (light mode; dark mode uses same hook)

  api-server/            # Express API
    src/
      app.ts             # Express setup: CORS, Clerk middleware, router
      routes/
        discuss.ts       # Posts, comments, upvotes
        matching.ts      # Match request + session endpoints
        sessions.ts      # Chat message endpoints
        profile.ts       # User profile
        topics.ts        # Topics + pattern progress
        achievements.ts  # Achievement list
      middlewares/
        requireAuth.ts   # Clerk → local user JIT provisioning
        clerkProxyMiddleware.ts

lib/
  db/                    # Drizzle schema + migrations
    src/schema/          # All table definitions
    drizzle.config.ts
  api-spec/              # OpenAPI YAML (source of truth for the API)
  api-zod/               # Zod validators generated from OpenAPI
  api-client-react/      # TanStack Query hooks generated from OpenAPI
```

## Design System

- **Primary color**: `#2f95dc` (blue)
- **Font**: Inter (400/500/600/700)
- **Post type accents**: question=`#f59e0b`, discussion=`#2f95dc`, resource=`#10b981`
- **Avatar colors**: 8 preset OKLCH-ish hues stored on the `users` table
- All screens use `useColors()` hook for theming tokens (background, card, foreground, border, mutedForeground, primary, destructive)

## Auth Flow

1. User opens app → `ClerkProvider` wraps root → `ClerkLoaded` waits for SDK
2. `(tabs)/_layout.tsx` checks `isSignedIn`; if false, redirects to `/(auth)/sign-in`
3. Sign-up: email + password → email verification code → into app
4. Sign-in: email + password → into app (MFA step if enabled)
5. On native: `setAuthTokenGetter(() => getToken())` attaches Clerk Bearer token to every API call
6. On web: browser cookie handles Clerk auth automatically
7. API `requireAuth` middleware reads the token/cookie, then JIT-provisions a local `users` row (auto-generates an anonymous handle + avatar color)

## Database Schema (key tables)

| Table | Purpose |
|---|---|
| `users` | clerk_user_id → local user profile (handle, avatar color, target companies) |
| `user_stats` | XP, streak, post/comment counts |
| `discuss_posts` | Community posts (type, title, content, topic tag, upvote/comment counts) |
| `post_comments` | Comments on posts |
| `post_upvotes` | Upvote join table |
| `match_requests` | Pending/matched partner search requests |
| `chat_sessions` | Active/ended co-learner sessions |
| `chat_messages` | Messages in a session (type: text/code/system) |
| `session_reports` | Report/block records |
| `topics` | Learning topic definitions |
| `dsa_patterns` | Pattern cards per topic |
| `topic_progress` / `pattern_progress` | Per-user progress |
| `achievements` / `user_achievements` | Badge definitions + grants |

## Running Locally

```bash
# Install deps (from workspace root)
pnpm install

# Push DB schema (first time or after schema changes)
pnpm --filter @workspace/db push

# Seed with sample data (optional)
pnpm --filter @workspace/db seed

# Start API server
pnpm --filter @workspace/api-server dev

# Start Expo app
pnpm --filter @workspace/interview-ace dev
```

## Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `DATABASE_URL` | Replit secret | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Replit secret (auto-provisioned) | Clerk server-side auth |
| `CLERK_PUBLISHABLE_KEY` | Replit secret (auto-provisioned) | Clerk client-side key |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Injected at dev start | Clerk key for Expo app |
| `EXPO_PUBLIC_DOMAIN` | Injected at dev start | API base URL for mobile |
| `PORT` | Injected by Replit | Server listen port |

## Key Conventions

- **Anonymous-first**: Users never see each other's real names. Handles are generated at sign-up.
- **All API routes require auth** (`requireAuth` is mounted at the router level). No public endpoints except `/health`.
- **Optimistic UI**: Post upvotes, comment submissions, and chat sends optimistically update the UI before the server confirms.
- **Poll-based real-time**: Chat messages poll every 3s; match status polls every 2s. No WebSockets.
- **OpenAPI as source of truth**: Any new endpoint must first be added to `lib/api-spec/openapi.yaml`, then `pnpm --filter @workspace/api-spec build` regenerates the Zod validators and React Query hooks.
