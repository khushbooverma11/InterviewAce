import { createHmac } from "node:crypto";
import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
router.use(requireAuth);

/**
 * GET /ice-servers
 * Returns ICE server config (STUN + TURN).
 *
 * Resolution order:
 *   1. Self-hosted Coturn  — when COTURN_HOST + COTURN_SECRET are set (production)
 *   2. Metered.ca          — when METERED_API_KEY is set (intermediate / dev fallback)
 *   3. STUN only           — when neither is configured (no public OpenRelay test creds
 *                            in production; calls work unless behind symmetric NAT)
 *
 * Coturn uses the REST API / HMAC credential scheme:
 *   username  = "<unix-timestamp-expiry>:<arbitrary-name>"
 *   credential = HMAC-SHA1(secret, username) → base64
 * This way credentials expire automatically and the TURN secret never leaves the server.
 */
router.get("/ice-servers", async (_req, res): Promise<void> => {
  res.set("Cache-Control", "no-store");

  // ── 1. Self-hosted Coturn (preferred) ────────────────────────────────────
  const coturnHost = process.env.COTURN_HOST;
  const coturnSecret = process.env.COTURN_SECRET;

  if (coturnHost && coturnSecret) {
    const ttl = 86_400; // credentials valid for 24 hours
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;
    const username = `${expiresAt}:interviewace`;
    const credential = createHmac("sha1", coturnSecret)
      .update(username)
      .digest("base64");

    res.json({
      iceServers: [
        // STUN — always include Google's free servers as the fast first-try
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // TURN over UDP (lowest latency)
        { urls: `turn:${coturnHost}:3478`, username, credential },
        // TURN over TCP (fallback when UDP is blocked)
        { urls: `turn:${coturnHost}:3478?transport=tcp`, username, credential },
        // TURN over TLS (firewall-proof; requires TLS cert on Coturn server)
        { urls: `turns:${coturnHost}:5349`, username, credential },
      ],
    });
    return;
  }

  // ── 2. Metered.ca (intermediate / dev fallback) ───────────────────────────
  const meteredApiKey = process.env.METERED_API_KEY;

  if (meteredApiKey) {
    try {
      const appName = process.env.METERED_APP_NAME ?? "interviewace";
      const url = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${meteredApiKey}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(4_000) });
      if (resp.ok) {
        const servers = await resp.json();
        res.json({ iceServers: servers });
        return;
      }
    } catch {
      // fall through to STUN-only
    }
  }

  // ── 3. STUN only (neither Coturn nor Metered configured) ─────────────────
  // Covers ~70–80 % of users (those not behind symmetric NAT).
  // Set COTURN_HOST + COTURN_SECRET to cover the remainder.
  res.json({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });
});

export default router;
