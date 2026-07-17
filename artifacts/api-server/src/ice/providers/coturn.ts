import { createHmac } from "node:crypto";
import type { IceServer, IceServerProvider } from "../types.js";

/**
 * CoturnProvider
 *
 * Generates short-lived HMAC credentials for a self-hosted Coturn TURN server.
 * Uses the Coturn REST API / HMAC scheme — credentials are signed server-side
 * and verified by Coturn independently, so the secret never leaves the server.
 *
 * Credential format:
 *   username   = "<unix-timestamp-expiry>:<app-name>"
 *   credential = base64(HMAC-SHA1(COTURN_SECRET, username))
 *
 * Required environment variables:
 *   COTURN_HOST    — hostname of the Coturn server (e.g. "turn.example.com")
 *   COTURN_SECRET  — shared secret configured in turnserver.conf as static-auth-secret
 *
 * Optional:
 *   COTURN_PORT_UDP  — UDP/TCP TURN port (default: 3478)
 *   COTURN_PORT_TLS  — TLS TURN port    (default: 5349)
 *   COTURN_TTL_SECS  — credential TTL   (default: 86400 = 24 h)
 *
 * To activate: ICE_PROVIDER=coturn  (or just set COTURN_HOST + COTURN_SECRET — auto-detected)
 * Setup guide: see COTURN_SETUP.md at the project root.
 */
export class CoturnProvider implements IceServerProvider {
  readonly name = "coturn";

  private readonly host: string;
  private readonly secret: string;
  private readonly portUdp: number;
  private readonly portTls: number;
  private readonly ttl: number;

  constructor() {
    const host = process.env.COTURN_HOST;
    const secret = process.env.COTURN_SECRET;

    if (!host) throw new Error("CoturnProvider: COTURN_HOST is not set.");
    if (!secret) throw new Error("CoturnProvider: COTURN_SECRET is not set.");

    this.host = host;
    this.secret = secret;
    this.portUdp = parseInt(process.env.COTURN_PORT_UDP ?? "3478", 10);
    this.portTls = parseInt(process.env.COTURN_PORT_TLS ?? "5349", 10);
    this.ttl = parseInt(process.env.COTURN_TTL_SECS ?? "86400", 10);
  }

  async getServers(): Promise<IceServer[]> {
    const expiresAt = Math.floor(Date.now() / 1000) + this.ttl;
    const username = `${expiresAt}:interviewace`;
    const credential = createHmac("sha1", this.secret)
      .update(username)
      .digest("base64");

    return [
      // ── STUN ──────────────────────────────────────────────────────────────
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },

      // ── TURN over UDP (lowest latency) ────────────────────────────────────
      {
        urls: `turn:${this.host}:${this.portUdp}`,
        username,
        credential,
      },
      // ── TURN over TCP (when UDP is blocked by a firewall) ─────────────────
      {
        urls: `turn:${this.host}:${this.portUdp}?transport=tcp`,
        username,
        credential,
      },
      // ── TURNS — TLS (firewall-proof; requires a valid TLS cert on Coturn) ─
      {
        urls: `turns:${this.host}:${this.portTls}`,
        username,
        credential,
      },
    ];
  }
}
