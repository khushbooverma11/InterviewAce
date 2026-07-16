import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { eq } from "drizzle-orm";
import { db, webrtcSignalsTable } from "@workspace/db";
import { logger } from "./lib/logger";
import { consumeWsTicket, consumePersonalWsTicket } from "./ws-tickets";

// ---------------------------------------------------------------------------
// Session rooms — WebRTC signaling
// sessionId → Map<userId, WebSocket>
// ---------------------------------------------------------------------------
const sessionRooms = new Map<number, Map<number, WebSocket>>();

// ---------------------------------------------------------------------------
// Personal rooms — DMs, notifications, calls, presence
// userId → WebSocket
// ---------------------------------------------------------------------------
const personalRooms = new Map<number, WebSocket>();

// ---------------------------------------------------------------------------
// Presence
// ---------------------------------------------------------------------------
type PresenceStatus = "online" | "offline" | "busy" | "in_session";
const presenceMap = new Map<number, PresenceStatus>();

export function getUserPresence(userId: number): PresenceStatus {
  return presenceMap.get(userId) ?? "offline";
}

/**
 * Send a JSON message to a user's personal WS channel.
 * Returns true if the message was delivered.
 */
export function sendToUser(userId: number, payload: unknown): boolean {
  const ws = personalRooms.get(userId);
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
    return true;
  }
  return false;
}

/**
 * Broadcast a presence update to a set of friend user IDs.
 */
function broadcastPresence(userId: number, status: PresenceStatus, friendIds: number[]) {
  const msg = JSON.stringify({ type: "presence_update", userId, status });
  for (const fid of friendIds) {
    const ws = personalRooms.get(fid);
    if (ws?.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export function setupWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/api/ws" });

  wss.on("connection", async (ws, req) => {
    try {
      const rawUrl = req.url ?? "/";
      const url = new URL(rawUrl, `http://${req.headers.host ?? "localhost"}`);
      const ticket = url.searchParams.get("ticket") ?? "";
      const scope = url.searchParams.get("scope") ?? "session";

      if (scope === "personal") {
        await handlePersonalConnection(ws, ticket);
      } else {
        await handleSessionConnection(ws, ticket);
      }
    } catch {
      ws.close(4000, "Bad request");
    }
  });

  logger.info("WebSocket signaling server ready at /api/ws");
}

// ---------------------------------------------------------------------------
// Session connection handler (WebRTC signaling — existing behaviour)
// ---------------------------------------------------------------------------

async function handleSessionConnection(ws: WebSocket, ticket: string) {
  const data = consumeWsTicket(ticket);
  if (!data) {
    ws.close(4001, "Invalid or expired ticket");
    return;
  }
  const { userId, sessionId } = data;

  if (!sessionRooms.has(sessionId)) sessionRooms.set(sessionId, new Map());
  const room = sessionRooms.get(sessionId)!;
  const existing = room.get(userId);
  if (existing?.readyState === WebSocket.OPEN) existing.close();
  room.set(userId, ws);

  logger.info({ userId, sessionId, roomSize: room.size }, "WS session peer joined");

  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as {
        type: string;
        signalType: string;
        payload: string;
      };
      if (msg.type !== "signal") return;

      const { signalType, payload } = msg;
      const currentRoom = sessionRooms.get(sessionId);
      if (!currentRoom) return;

      const recipientId = [...currentRoom.keys()].find((id) => id !== userId);
      const recipientWs = recipientId != null ? currentRoom.get(recipientId) : undefined;
      const wsDelivered = recipientWs?.readyState === WebSocket.OPEN;

      const [inserted] = await db
        .insert(webrtcSignalsTable)
        .values({
          sessionId,
          senderId: userId,
          recipientId: recipientId ?? userId,
          type: signalType,
          payload,
        })
        .returning({ id: webrtcSignalsTable.id });

      if (wsDelivered && recipientWs) {
        recipientWs.send(JSON.stringify({ type: "signal", signalType, payload }));
        if (inserted) {
          db.update(webrtcSignalsTable)
            .set({ consumed: true })
            .where(eq(webrtcSignalsTable.id, inserted.id))
            .catch(() => {});
        }
      }
    } catch (err) {
      logger.warn({ err }, "WS session message error");
    }
  });

  ws.on("close", () => {
    const r = sessionRooms.get(sessionId);
    if (r) {
      r.delete(userId);
      if (r.size === 0) sessionRooms.delete(sessionId);
    }
    logger.info({ userId, sessionId }, "WS session peer left");
  });

  ws.on("error", (err) => logger.warn({ err, userId, sessionId }, "WS session error"));

  ws.send(JSON.stringify({ type: "connected", sessionId, userId }));
}

// ---------------------------------------------------------------------------
// Personal connection handler (DMs, notifications, calls, presence)
// ---------------------------------------------------------------------------

async function handlePersonalConnection(ws: WebSocket, ticket: string) {
  const data = consumePersonalWsTicket(ticket);
  if (!data) {
    ws.close(4001, "Invalid or expired personal ticket");
    return;
  }
  const { userId } = data;

  // Replace any existing personal connection
  const existing = personalRooms.get(userId);
  if (existing?.readyState === WebSocket.OPEN) existing.close();
  personalRooms.set(userId, ws);

  // Mark online and notify friends
  presenceMap.set(userId, "online");
  const friendIds = await getFriendIds(userId);
  broadcastPresence(userId, "online", friendIds);

  logger.info({ userId }, "WS personal channel connected");

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as { type: string; [k: string]: unknown };

      if (msg.type === "presence") {
        const status = (msg.status as PresenceStatus) ?? "online";
        presenceMap.set(userId, status);
        broadcastPresence(userId, status, friendIds);
        return;
      }

      if (msg.type === "dm_typing") {
        const recipientId = msg.recipientId as number;
        sendToUser(recipientId, {
          type: "dm_typing",
          fromUserId: userId,
          isTyping: msg.isTyping,
        });
        return;
      }
    } catch (err) {
      logger.warn({ err, userId }, "WS personal message error");
    }
  });

  ws.on("close", () => {
    personalRooms.delete(userId);
    presenceMap.set(userId, "offline");
    broadcastPresence(userId, "offline", friendIds);
    logger.info({ userId }, "WS personal channel disconnected");
  });

  ws.on("error", (err) => logger.warn({ err, userId }, "WS personal error"));

  ws.send(JSON.stringify({ type: "connected", userId, scope: "personal" }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getFriendIds(userId: number): Promise<number[]> {
  try {
    const { friendshipsTable } = await import("@workspace/db");
    const { or, and } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(friendshipsTable)
      .where(
        and(
          or(
            eq(friendshipsTable.requesterId, userId),
            eq(friendshipsTable.recipientId, userId),
          ),
          eq(friendshipsTable.status, "accepted"),
        ),
      );
    return rows.map((r) => (r.requesterId === userId ? r.recipientId : r.requesterId));
  } catch {
    return [];
  }
}
