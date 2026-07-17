import type { IceServer, IceServerProvider } from "../types.js";

/**
 * OpenRelayProvider
 *
 * Uses Metered.ca's free public OpenRelay TURN servers.
 * No credentials required — these are shared community servers.
 *
 * ⚠️  Development / zero-cost fallback only.
 *     Fine for local testing and early-stage apps with low traffic.
 *     At production scale, switch to MeteredProvider or CoturnProvider:
 *       ICE_PROVIDER=metered  (+ METERED_APP_NAME + METERED_API_KEY)
 *       ICE_PROVIDER=coturn   (+ COTURN_HOST + COTURN_SECRET)
 */
export class OpenRelayProvider implements IceServerProvider {
  readonly name = "openrelay";

  async getServers(): Promise<IceServer[]> {
    return [
      // ── STUN (always first — fast, free, no relay overhead) ──────────────
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },

      // ── TURN via OpenRelay (public, shared, no auth) ──────────────────────
      // Replace this block with MeteredProvider or CoturnProvider in production.
      { urls: "stun:openrelay.metered.ca:80" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turns:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ];
  }
}
