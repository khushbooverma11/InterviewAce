---
name: Discuss feature architecture
description: What was built for the Discuss feature, key patterns, and what's needed to activate it end-to-end.
---

## What was built
All Discuss screens and shared components are complete:

### Components (`artifacts/interview-ace/components/discuss/`)
- `AvatarBadge.tsx` — colored circle with handle initials, tinted background
- `TopicChip.tsx` — filter pill with active/inactive state
- `PostCard.tsx` — full post card with type badge, upvote/comment footer
- `MessageBubble.tsx` — chat bubble (mine=right/primary, theirs=left/card, system=centered)

### Screens (`artifacts/interview-ace/app/`)
- `(tabs)/discuss.tsx` — Feed tab: "Discuss" header + New Post CTA, Community Feed/Study Partners segmented control, search, topic filter chips, post FlatList, partner session cards
- `discuss/[id].tsx` — Post detail: full post + comment list + sticky comment input
- `discuss/new-post.tsx` — Create post: type picker (question/discussion/resource), title, content, topic tag + suggestions; presented as modal
- `discuss/find-partner.tsx` — Partner matching: configure (topic/skill/duration/chat type) → searching (animated pulse ring, 2s poll) → matched (success state → navigate to chat)
- `discuss/chat/[id].tsx` — Chat screen: 3s polling for messages, code/text toggle, report/block action sheet, end session

### Navigation
- `(tabs)/_layout.tsx` — Discuss tab added: SF `bubble.left.and.bubble.right` (iOS 26), Feather `message-circle` (others)
- `_layout.tsx` — Stack screens: `discuss/[id]`, `discuss/new-post` (modal), `discuss/find-partner`, `discuss/chat/[id]`

## To activate end-to-end
All API calls return 500 until Clerk keys are added:
- `CLERK_SECRET_KEY` → API server secret
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` → mobile app publishable key

**Why:** The API server wraps all routes in `requireAuth` Clerk middleware; without a valid secret key the middleware throws on every request.

## Key patterns used
- All API data from `@workspace/api-client-react` React Query hooks
- Colors from `useColors()` hook — no hardcoded tokens except accent colors for post types (amber/blue/green)
- Post type colors: question=`#f59e0b`, discussion=`#2f95dc`, resource=`#10b981`
- Chat polling: `refetchInterval: 3000` via query options; disabled when session ended
- Match polling: `refetchInterval: 2000`; enabled only when `matchId !== null && stage === 'searching'`
