/**
 * ICE Server Provider Abstraction
 *
 * Adding a new TURN provider requires only:
 *   1. Create a class in `providers/` that implements IceServerProvider
 *   2. Add it to the factory in `factory.ts`
 *   3. Set ICE_PROVIDER=<name> (+ any credentials) in the environment
 *
 * The mobile app never knows which provider is active.
 */

/**
 * A single ICE server entry — matches the RTCIceServer shape expected by WebRTC.
 */
export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

/**
 * Contract that every provider must satisfy.
 *
 * `getServers()` must always include at least one STUN server (Google's free
 * STUN is prepended automatically by the factory — providers only need to
 * return their TURN entries, but returning STUN too is harmless).
 */
export interface IceServerProvider {
  /** Human-readable name logged at startup for visibility. */
  readonly name: string;

  /**
   * Returns the list of ICE servers for this provider.
   * May be async (e.g. Metered fetches credentials from an external API).
   * Should throw if credentials are configured but the upstream call fails,
   * so the factory can surface a clear error rather than silently falling back.
   */
  getServers(): Promise<IceServer[]>;
}
