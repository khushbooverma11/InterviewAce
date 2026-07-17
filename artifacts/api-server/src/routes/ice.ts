import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createIceServerProvider } from "../ice/factory.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();
router.use(requireAuth);

/**
 * Resolve the provider once at module load.
 * All requests share the same provider instance.
 * To change provider: update ICE_PROVIDER env var and restart the server.
 */
const provider = createIceServerProvider();

/**
 * GET /api/ice-servers
 *
 * Returns the ICE server list for the current provider.
 * The mobile app calls this at the start of every call and uses whatever
 * it receives — it never has hardcoded STUN/TURN addresses.
 *
 * Response shape:
 *   { iceServers: Array<{ urls, username?, credential? }> }
 *
 * Cache-Control: no-store — credentials are time-limited; never cache.
 */
router.get("/ice-servers", async (_req, res): Promise<void> => {
  try {
    const iceServers = await provider.getServers();
    res.set("Cache-Control", "no-store").json({ iceServers });
  } catch (err) {
    logger.error({ err, provider: provider.name }, "ICE provider failed to return servers");
    res.status(502).json({
      error: "Could not retrieve ICE server configuration. Please try again.",
    });
  }
});

export default router;
