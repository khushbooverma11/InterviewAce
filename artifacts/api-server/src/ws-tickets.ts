import { randomBytes } from "node:crypto";

// ---------------------------------------------------------------------------
// Session-scoped tickets (WebRTC signaling)
// ---------------------------------------------------------------------------

interface SessionTicketData {
  scope: "session";
  userId: number;
  sessionId: number;
  expiresAt: number;
}

/** One-time WS auth tickets for session signaling — 30 s window. */
const sessionTickets = new Map<string, SessionTicketData>();

// ---------------------------------------------------------------------------
// Personal-scoped tickets (DMs, notifications, calls, presence)
// ---------------------------------------------------------------------------

interface PersonalTicketData {
  scope: "personal";
  userId: number;
  expiresAt: number;
}

/** One-time WS auth tickets for personal channels — 30 s window. */
const personalTickets = new Map<string, PersonalTicketData>();

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessionTickets) {
    if (v.expiresAt < now) sessionTickets.delete(k);
  }
  for (const [k, v] of personalTickets) {
    if (v.expiresAt < now) personalTickets.delete(k);
  }
}, 60_000);

// ---------------------------------------------------------------------------
// Session tickets
// ---------------------------------------------------------------------------

export function issueWsTicket(userId: number, sessionId: number): string {
  const ticket = randomBytes(32).toString("hex");
  sessionTickets.set(ticket, {
    scope: "session",
    userId,
    sessionId,
    expiresAt: Date.now() + 30_000,
  });
  return ticket;
}

export function consumeWsTicket(
  ticket: string,
): { scope: "session"; userId: number; sessionId: number } | null {
  const data = sessionTickets.get(ticket);
  if (!data || data.expiresAt < Date.now()) return null;
  sessionTickets.delete(ticket);
  return { scope: "session", userId: data.userId, sessionId: data.sessionId };
}

// ---------------------------------------------------------------------------
// Personal tickets
// ---------------------------------------------------------------------------

export function issuePersonalWsTicket(userId: number): string {
  const ticket = randomBytes(32).toString("hex");
  personalTickets.set(ticket, {
    scope: "personal",
    userId,
    expiresAt: Date.now() + 30_000,
  });
  return ticket;
}

export function consumePersonalWsTicket(
  ticket: string,
): { scope: "personal"; userId: number } | null {
  const data = personalTickets.get(ticket);
  if (!data || data.expiresAt < Date.now()) return null;
  personalTickets.delete(ticket);
  return { scope: "personal", userId: data.userId };
}
