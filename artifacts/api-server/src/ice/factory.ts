import { logger } from "../lib/logger.js";
import type { IceServerProvider } from "./types.js";
import { OpenRelayProvider } from "./providers/openrelay.js";
import { MeteredProvider } from "./providers/metered.js";
import { CoturnProvider } from "./providers/coturn.js";

/**
 * createIceServerProvider
 *
 * Resolves which ICE provider to use based on environment configuration.
 * Called once at server startup; the chosen provider is reused for every request.
 *
 * Resolution order
 * ────────────────
 * 1. Explicit ICE_PROVIDER env var — use exactly that provider (throws if its
 *    required credentials are missing so misconfiguration fails loudly).
 *
 * 2. Auto-detect from available credentials (ICE_PROVIDER not set):
 *    a. COTURN_HOST + COTURN_SECRET → CoturnProvider   (self-hosted, cheapest at scale)
 *    b. METERED_API_KEY             → MeteredProvider  (managed, usage-based billing)
 *    c. (none)                      → OpenRelayProvider (free public servers, dev only)
 *
 * To switch providers later:
 *   - Set ICE_PROVIDER=metered + METERED_APP_NAME + METERED_API_KEY, redeploy.
 *   - Set ICE_PROVIDER=coturn  + COTURN_HOST + COTURN_SECRET, redeploy.
 *   - The mobile app never changes.
 */
export function createIceServerProvider(): IceServerProvider {
  const explicit = (process.env.ICE_PROVIDER ?? "").toLowerCase().trim();

  // ── Explicit ICE_PROVIDER ─────────────────────────────────────────────────
  if (explicit === "coturn") {
    const p = new CoturnProvider(); // throws if COTURN_HOST / COTURN_SECRET missing
    logger.info({ provider: p.name }, "ICE provider selected (explicit)");
    return p;
  }

  if (explicit === "metered") {
    const p = new MeteredProvider(); // throws if METERED_API_KEY / APP_NAME missing
    logger.info({ provider: p.name }, "ICE provider selected (explicit)");
    return p;
  }

  if (explicit === "openrelay") {
    const p = new OpenRelayProvider();
    logger.info({ provider: p.name }, "ICE provider selected (explicit)");
    return p;
  }

  if (explicit !== "") {
    throw new Error(
      `Unknown ICE_PROVIDER "${explicit}". Valid values: openrelay | metered | coturn`,
    );
  }

  // ── Auto-detect from credentials ──────────────────────────────────────────
  if (process.env.COTURN_HOST && process.env.COTURN_SECRET) {
    const p = new CoturnProvider();
    logger.info({ provider: p.name }, "ICE provider auto-detected");
    return p;
  }

  if (process.env.METERED_API_KEY) {
    const p = new MeteredProvider();
    logger.info({ provider: p.name }, "ICE provider auto-detected");
    return p;
  }

  // ── Default ───────────────────────────────────────────────────────────────
  const p = new OpenRelayProvider();
  logger.info(
    { provider: p.name },
    "ICE provider: OpenRelay (dev default — set ICE_PROVIDER=metered or coturn for production)",
  );
  return p;
}
