import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
router.use(requireAuth);

/**
 * GET /ice-servers
 * Returns ICE server config (STUN + TURN).
 * When METERED_API_KEY is set, fetches live credentials from Metered.ca.
 */
router.get("/ice-servers", async (_req, res): Promise<void> => {
  const apiKey = process.env.METERED_API_KEY;

  if (apiKey) {
    try {
      const appName = process.env.METERED_APP_NAME ?? "interviewace";
      const url = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (resp.ok) {
        const servers = await resp.json();
        res.json({ iceServers: servers });
        return;
      }
    } catch {
      /* fall through to STUN-only fallback */
    }
  }

  // Default: public OpenRelay TURN servers (Metered.ca test infrastructure).
  // Works for development/testing without any credentials.
  // For production, set METERED_API_KEY + METERED_APP_NAME env vars.
  res.json({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
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
    ],
  });
});

export default router;
