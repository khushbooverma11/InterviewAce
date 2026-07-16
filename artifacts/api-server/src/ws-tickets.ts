import { randomBytes } from "node:crypto";

interface TicketData {
  userId: number;
  sessionId: number;
  expiresAt: number;
}

/** One-time WS auth tickets — 30 s window to open the connection. */
const tickets = new Map<string, TicketData>();

// Periodic cleanup of expired tickets
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of tickets) {
    if (v.expiresAt < now) tickets.delete(k);
  }
}, 60_000);

export function issueWsTicket(userId: number, sessionId: number): string {
  const ticket = randomBytes(32).toString("hex");
  tickets.set(ticket, { userId, sessionId, expiresAt: Date.now() + 30_000 });
  return ticket;
}

export function consumeWsTicket(ticket: string): TicketData | null {
  const data = tickets.get(ticket);
  if (!data || data.expiresAt < Date.now()) return null;
  tickets.delete(ticket); // one-time use
  return data;
}
