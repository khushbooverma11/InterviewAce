import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { eq } from "drizzle-orm";
import { db, webrtcSignalsTable } from "@workspace/db";
import { logger } from "./lib/logger";
import { consumeWsTicket } from "./ws-tickets";

/** Live signaling rooms: sessionId → Map<userId, WebSocket> */
const rooms = new Map<number, Map<number, WebSocket>>();

export function setupWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/api/ws" });

  wss.on("connection", async (ws, req) => {
    let sessionId: number;
    let userId: number;

    try {
      const rawUrl = req.url ?? "/";
      const url = new URL(rawUrl, `http://${req.headers.host ?? "localhost"}`);
      const ticket = url.searchParams.get("ticket") ?? "";
      const data = consumeWsTicket(ticket);
      if (!data) {
        ws.close(4001, "Invalid or expired ticket");
        return;
      }
      ({ userId, sessionId } = data);
    } catch {
      ws.close(4000, "Bad request");
      return;
    }

    // Join room (close any stale connection for this user)
    if (!rooms.has(sessionId)) rooms.set(sessionId, new Map());
    const room = rooms.get(sessionId)!;
    const existing = room.get(userId);
    if (existing && existing.readyState === WebSocket.OPEN) existing.close();
    room.set(userId, ws);

    logger.info({ userId, sessionId, roomSize: room.size }, "WS peer joined");

    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as {
          type: string;
          signalType: string;
          payload: string;
        };
        if (msg.type !== "signal") return;

        const { signalType, payload } = msg;
        const currentRoom = rooms.get(sessionId);
        if (!currentRoom) return;

        // Find the other peer's user id
        const recipientId = [...currentRoom.keys()].find((id) => id !== userId);
        const recipientWs = recipientId != null ? currentRoom.get(recipientId) : undefined;
        const wsDelivered = recipientWs?.readyState === WebSocket.OPEN;

        // Always persist to DB so late-arriving HTTP pollers can still recover
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
          // Real-time forward
          recipientWs.send(JSON.stringify({ type: "signal", signalType, payload }));
          // Mark consumed so HTTP polling doesn't re-deliver
          if (inserted) {
            db.update(webrtcSignalsTable)
              .set({ consumed: true })
              .where(eq(webrtcSignalsTable.id, inserted.id))
              .catch(() => {});
          }
        }
      } catch (err) {
        logger.warn({ err }, "WS message error");
      }
    });

    ws.on("close", () => {
      const r = rooms.get(sessionId);
      if (r) {
        r.delete(userId);
        if (r.size === 0) rooms.delete(sessionId);
      }
      logger.info({ userId, sessionId }, "WS peer left");
    });

    ws.on("error", (err) => logger.warn({ err, userId, sessionId }, "WS error"));

    // Acknowledge
    ws.send(JSON.stringify({ type: "connected", sessionId, userId }));
  });

  logger.info("WebSocket signaling server ready at /api/ws");
}
