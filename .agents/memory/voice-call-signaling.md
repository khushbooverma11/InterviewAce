---
name: Voice call signaling architecture
description: How WebRTC signaling works in the app — WS primary, HTTP fallback, ICE servers endpoint.
---

WebSocket server is in `artifacts/api-server/src/ws-server.ts`, attached to the http.Server (not Express) in `index.ts`.

**Auth flow:** `GET /api/discuss/sessions/:id/ws-ticket` issues a 30-second one-time token from `ws-tickets.ts`. Client opens `wss://…/api/ws?sessionId=:id&ticket=:token`. Ticket is consumed on first WS connection.

**Signal delivery:** WS handler writes signal to `webrtc_signals` DB table, then forwards in real-time to the other peer's WS. If delivered via WS, marks it `consumed=true` immediately so HTTP polling doesn't re-deliver it. If recipient not in WS room, signal stays in DB for polling to pick up.

**Client:** `VoiceCallView.tsx` opens WS first, then sends offer. HTTP polling runs at 3 s (fallback). Signals deduped via `offerSetRef`/`answerSetRef` booleans.

**ICE servers:** `GET /api/ice-servers` returns STUN + OpenRelay TURN (public test credentials: `openrelayproject`/`openrelayproject`). When `METERED_API_KEY` + `METERED_APP_NAME` env vars are set, fetches live Metered.ca credentials instead.

**Why:** HTTP-only polling had 4-15s call setup time due to 1.5s poll cycles. WS reduces handshake to ~1s.
