import type { IceServer, IceServerProvider } from "../types.js";

/**
 * MeteredProvider
 *
 * Fetches short-lived TURN credentials from the Metered.ca REST API.
 * Each call returns fresh credentials that expire after a fixed window.
 *
 * Required environment variables:
 *   METERED_API_KEY   — your Metered account API key
 *   METERED_APP_NAME  — your Metered app subdomain (e.g. "myapp" → myapp.metered.live)
 *
 * Free tier: 1 GB TURN relay / month — sufficient for early production.
 * Paid tiers: usage-based at ~$0.40–$0.75 / GB.
 *
 * To activate: ICE_PROVIDER=metered  (or just set the env vars — factory auto-detects)
 * To switch away: set ICE_PROVIDER=coturn and add COTURN_HOST + COTURN_SECRET.
 */
export class MeteredProvider implements IceServerProvider {
  readonly name = "metered";

  private readonly apiKey: string;
  private readonly appName: string;

  constructor() {
    const apiKey = process.env.METERED_API_KEY;
    const appName = process.env.METERED_APP_NAME;

    if (!apiKey) throw new Error("MeteredProvider: METERED_API_KEY is not set.");
    if (!appName) throw new Error("MeteredProvider: METERED_APP_NAME is not set.");

    this.apiKey = apiKey;
    this.appName = appName;
  }

  async getServers(): Promise<IceServer[]> {
    const url =
      `https://${this.appName}.metered.live/api/v1/turn/credentials` +
      `?apiKey=${this.apiKey}`;

    const resp = await fetch(url, { signal: AbortSignal.timeout(5_000) });

    if (!resp.ok) {
      throw new Error(
        `MeteredProvider: credential fetch failed — HTTP ${resp.status} from ${url}`,
      );
    }

    // Metered returns the full ICE server list including STUN entries.
    const servers = (await resp.json()) as IceServer[];

    // Ensure Google STUN is always present at the top even if Metered omits it.
    const hasGoogleStun = servers.some(
      (s) =>
        (typeof s.urls === "string" ? s.urls : s.urls[0])?.includes("stun.l.google.com"),
    );

    return hasGoogleStun
      ? servers
      : [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          ...servers,
        ];
  }
}
