# InterviewAce — Technology Migration Plan

This document maps every component of the **current stack** to the **target stack**,
explains what changes and why, and lists what needs to be built or removed.

---

## Stack Comparison at a Glance

| Layer | Current (Replit) | Target |
|---|---|---|
| Mobile app | React Native via Expo | React Native via Expo ✅ (unchanged) |
| Authentication | Clerk (Replit-managed) | Clerk (self-managed account) ✅ (unchanged) |
| Database | Replit built-in PostgreSQL | **Supabase PostgreSQL** |
| ORM | Drizzle ORM | Drizzle ORM ✅ (unchanged) |
| Real-time / signaling | `ws` WebSocket server + HTTP polling | **Supabase Realtime** |
| Voice call media | WebRTC (react-native-webrtc) | WebRTC ✅ (unchanged) |
| STUN servers | Google public STUN | Google public STUN ✅ (unchanged) |
| TURN relay | OpenRelay public test servers (Metered.ca) | **Self-hosted Coturn** |
| Push notifications | None | **Firebase Cloud Messaging (FCM)** |
| Backend hosting | Replit Autoscale | **Railway / Fly.io / Render** |
| Distribution | — | **Apple App Store + Google Play Store** |

---

## 1. Database — Replit PostgreSQL → Supabase PostgreSQL

### What we use now
- Replit's built-in Postgres, connected via `DATABASE_URL` secret
- No connection pooler; max ~25 simultaneous connections

### What changes
- **Replace** `DATABASE_URL` with the Supabase connection string (both a direct connection
  string for migrations and a **pgBouncer pooler URL** for the API server at runtime)
- **Keep** Drizzle ORM and all schema files (`lib/db/src/schema/`) unchanged —
  Supabase is standard Postgres, so no query changes are needed
- Run `pnpm --filter @workspace/db push` against the new Supabase database to create tables

### Why
| Problem today | Supabase fix |
|---|---|
| 25-connection hard limit, no pooler | Built-in PgBouncer pooler (thousands of logical connections) |
| No backups or point-in-time restore | Daily backups + PITR on paid plan |
| Tied to Replit account | Portable, works with any hosting platform |
| No read replicas | Read replicas available on Pro |

### Files to change
```
lib/db/src/index.ts          — update connection string env var name if needed
.env / Replit Secrets         — replace DATABASE_URL with Supabase values
                               (DATABASE_URL for migrations, DATABASE_POOL_URL for runtime)
```

---

## 2. Real-time / Signaling — Custom WebSocket server → Supabase Realtime

### What we use now
- `ws` npm package running a WebSocket server inside the Express app (`artifacts/api-server/src/ws-server.ts`)
- In-memory `sessionRooms` map — breaks across multiple server instances (autoscale bug)
- HTTP polling fallback every 3 s (`GET /discuss/sessions/:id/signals`) writing to `webrtc_signals` table
- `artifacts/api-server/src/ws-tickets.ts` — one-time ticket system to authenticate WS connections

### What changes
- **Remove** `ws-server.ts`, `ws-tickets.ts`, and the `/api/ws` endpoint entirely
- **Remove** the `webrtc_signals` database table and its Drizzle schema
- **Remove** the `/api/discuss/sessions/:id/signals` GET and POST HTTP polling routes
- **Add** Supabase Realtime channels on the client for WebRTC signaling:
  - Each voice session gets a Realtime channel keyed by `session:{sessionId}`
  - Signals (offer / answer / ice-candidate / hangup) are broadcast as Realtime messages
  - No database writes needed for signaling — Realtime is a pub/sub layer, not storage
- **Keep** the HTTP POST `/signal` route optionally as a fallback, but Realtime makes polling unnecessary

### How Supabase Realtime replaces the signaling flow

```
Current flow
────────────
Caller → POST /api/signal → DB (webrtc_signals table)
Callee → GET /api/signals (polls every 3 s) → reads from DB

Target flow
───────────
Caller → supabase.channel('session:42').send({ type: 'offer', payload: sdp })
Callee ← supabase.channel('session:42').on('broadcast', handler)
         (delivered in < 100 ms, no polling, no DB table)
```

### Why
| Problem today | Supabase Realtime fix |
|---|---|
| In-memory rooms break on multi-instance | Realtime is a managed service — all instances share it |
| 3 s polling latency delays ICE exchange | Sub-100 ms push delivery |
| 304 caching bug on polling endpoint | No polling at all |
| Extra `webrtc_signals` DB table to maintain | Eliminated |

### Files to change
```
artifacts/api-server/src/ws-server.ts          — DELETE
artifacts/api-server/src/ws-tickets.ts         — DELETE
artifacts/api-server/src/routes/sessions.ts    — remove GET/POST /signals routes,
                                                  remove ws-ticket route
artifacts/api-server/src/app.ts                — remove setupWebSocketServer() call,
                                                  remove ws dependency
artifacts/api-server/package.json              — remove `ws` package
artifacts/interview-ace/components/discuss/
  VoiceCallView.tsx                            — replace openSignalingSocket(),
                                                  postSignalHttp(), fetchSignalsHttp(),
                                                  pollSignals() with Supabase Realtime
                                                  channel subscribe/send
lib/db/src/schema/webrtcSignals.ts             — DELETE (table no longer needed)
lib/db/src/index.ts                            — remove webrtcSignalsTable export
```

---

## 3. TURN Relay — OpenRelay (public test) → Self-hosted Coturn

### What we use now
- Public OpenRelay TURN servers with shared credentials (`openrelayproject/openrelayproject`)
- Falls back to these when `METERED_API_KEY` is not set
- Suitable for development only — shared, rate-limited, unreliable for production

### What changes
- **Deploy** a Coturn server on a cheap VPS (DigitalOcean $6/month, Hetzner €4/month, or Oracle Cloud free tier)
- **Configure** Coturn with a secret and realm, generate time-limited HMAC credentials server-side
- **Update** `artifacts/api-server/src/routes/ice.ts` — replace the Metered.ca API call with
  your own HMAC credential generation pointing to your Coturn server
- **Remove** the `METERED_API_KEY` / `METERED_APP_NAME` env vars (no longer needed)

### Coturn credential generation (replaces ice.ts logic)
```ts
// Server generates short-lived TURN credentials on the fly
const ttl = 86400; // 24 hours
const timestamp = Math.floor(Date.now() / 1000) + ttl;
const username = `${timestamp}:interviewace`;
const credential = createHmac('sha1', COTURN_SECRET).update(username).digest('base64');
res.json({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: `turn:your.coturn.host:3478`, username, credential },
    { urls: `turns:your.coturn.host:5349`, username, credential },
  ]
});
```

### Why
| Problem today | Coturn fix |
|---|---|
| Shared public credentials — anyone can use them | Your own private server, credentials scoped to your app |
| Rate-limited, unreliable for production | Dedicated bandwidth — you control capacity |
| Per-GB cost on Metered.ca at scale | VPS flat monthly rate — ~$6–20/month regardless of usage |
| No control over server region | Deploy in same region as your users (EU, US-East, Asia) |

### Files to change
```
artifacts/api-server/src/routes/ice.ts   — replace Metered.ca fetch with HMAC generation
artifacts/api-server/src/app.ts          — add COTURN_SECRET env var read
Replit Secrets / Railway env vars         — add COTURN_SECRET, COTURN_HOST
```

---

## 4. Push Notifications — None → Firebase Cloud Messaging (FCM)

### What we use now
- Nothing. Incoming call notifications only work if the recipient's app is open and their
  personal WebSocket is connected. If the app is backgrounded or killed, they miss the call.

### What changes
- **Add** `expo-notifications` and `@react-native-firebase/messaging` (or use Expo's FCM integration)
- **Register** each device's FCM token on login and store it in the `users` table (new column: `fcm_token`)
- **When a call is initiated** (`POST /api/discuss/sessions/:id/call`), the server sends an FCM
  Data Message to the recipient's token — this wakes the app even if it's killed
- **On iOS**, use APNs VoIP pushes (`expo-notifications` with VoIP entitlement) for CallKit integration
- **On Android**, FCM high-priority message wakes the app; show an incoming call notification

### Database change
```sql
ALTER TABLE users ADD COLUMN fcm_token TEXT;
```

### Files to change
```
artifacts/interview-ace/app/_layout.tsx          — register for push notifications on startup,
                                                    POST token to /api/me/fcm-token
artifacts/api-server/src/routes/sessions.ts      — on call initiation, send FCM push to recipient
artifacts/api-server/src/routes/users.ts         — add PUT /api/me/fcm-token route
lib/db/src/schema/users.ts                       — add fcm_token column
artifacts/interview-ace/app.json                 — add FCM config, notification permissions,
                                                    UIBackgroundModes: voip + audio (iOS)
```

---

## 5. Backend Hosting — Replit Autoscale → Railway / Fly.io / Render

### What we use now
- Replit Autoscale for the Express API server (`artifacts/api-server`)
- Cold starts on free plan
- WebSocket support is limited (connections reset on instance cycling)
- The Expo web export (`artifacts/interview-ace`) served separately

### What changes
- **Deploy** `artifacts/api-server` as a Node.js service on Railway, Fly.io, or Render
- **Set** all environment secrets in the new platform's dashboard (Clerk keys, Supabase URL, Coturn secret, FCM credentials)
- **The Expo mobile app** does not need a web host once it's on the App Store — the API is the only server component

### Platform comparison

| | Railway | Fly.io | Render |
|---|---|---|---|
| **Pricing** | $5/month + usage | Pay per compute | Free tier, then $7/month |
| **WebSocket support** | ✅ Full | ✅ Full | ✅ Full |
| **Cold starts** | None (always-on) | None | Free tier only |
| **Global regions** | US, EU | 30+ regions | US, EU, Singapore |
| **Deploy command** | `railway up` | `fly deploy` | Git push |
| **Best for** | Simple Node apps | Multi-region, latency-sensitive | Simplest setup |

**Recommendation:** Railway for its simplicity; Fly.io if you need multi-region (lowest TURN relay latency).

### Files to change
```
artifacts/api-server/Dockerfile (new)           — standard Node 22 Dockerfile
                                                   (Railway/Fly can also auto-detect Node)
railway.toml / fly.toml (new)                   — deploy config
artifacts/api-server/.replit-artifact/           — no longer needed (Replit-specific)
```

---

## 6. App Distribution — App Store + Play Store

### What we need
Both stores require a **custom Expo build** (EAS Build) because `react-native-webrtc`
is a native module that cannot run in Expo Go.

### Steps (one-time setup)
1. Install EAS CLI: `npm install -g eas-cli`
2. `eas build:configure` in `artifacts/interview-ace/`
3. Add to `artifacts/interview-ace/app.json`:
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.yourcompany.interviewace",
       "infoPlist": {
         "UIBackgroundModes": ["audio", "voip", "fetch", "remote-notification"],
         "NSMicrophoneUsageDescription": "InterviewAce needs your microphone for voice practice sessions."
       }
     },
     "android": {
       "package": "com.yourcompany.interviewace",
       "permissions": ["RECORD_AUDIO", "INTERNET"]
     }
   }
   ```
4. `eas build --platform all` — produces `.ipa` (iOS) and `.aab` (Android)
5. Submit via `eas submit`

### Accounts needed
| Account | Cost | Purpose |
|---|---|---|
| Apple Developer Program | $99/year | iOS App Store distribution |
| Google Play Console | $25 one-time | Android Play Store distribution |
| EAS Build (Expo) | Free (30 builds/month) or $99/month unlimited | Build service |

---

## Migration Order (Recommended Sequence)

Do these in order to avoid breaking the running app:

```
Step 1 — Supabase DB
  Create Supabase project → export Replit DB → import to Supabase
  → update DATABASE_URL secret → run drizzle push → verify API still works

Step 2 — New hosting (Railway/Fly)
  Deploy API to Railway → point mobile app API base URL to new host
  → decommission Replit API server

Step 3 — Supabase Realtime (replaces WS + polling)
  Add supabase-js to mobile app and API server
  → rewrite VoiceCallView signaling to use Realtime channels
  → delete ws-server.ts, webrtc_signals table, polling routes
  → test voice calls end-to-end

Step 4 — Coturn (replaces OpenRelay)
  Spin up VPS → install Coturn → configure with HMAC auth
  → update ice.ts → test calls with TURN forced on (disable STUN)

Step 5 — FCM push notifications
  Add Firebase project → configure expo-notifications
  → add fcm_token column → implement incoming call wake-up push
  → test with app in background and killed state

Step 6 — EAS Build + App Store submission
  Configure app.json → eas build → internal testing track
  → fix any native issues → submit to App Store + Play Store
```

---

## What Does NOT Change

These are already correct and require no migration work:

- **React Native + Expo** — same framework, same version
- **Clerk** — same auth provider; just move from Replit-managed to your own Clerk account so keys are portable
- **Drizzle ORM** — all schema files, migrations, and query code stay identical (Supabase is standard Postgres)
- **WebRTC** (`react-native-webrtc`) — same library, same peer connection code in `VoiceCallView.tsx`
- **Google STUN** — free and unlimited, no change needed
- **All business logic** — matching, sessions, friends, discuss posts, DSA topics — untouched

---

*Last updated: 2026-07-16*
