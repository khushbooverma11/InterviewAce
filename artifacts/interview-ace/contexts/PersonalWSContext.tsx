import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react';

export type PresenceStatus = 'online' | 'offline' | 'busy' | 'in_session';

export interface IncomingCall {
  sessionId: number;
  friendshipId: number;
  callerId: number;
  callerHandle: string;
  callerColor: string;
}

interface PersonalWSContextValue {
  isConnected: boolean;
  presenceMap: Record<number, PresenceStatus>;
  typingUsers: Record<number, boolean>;
  incomingCall: IncomingCall | null;
  unreadCount: number;
  clearIncomingCall: () => void;
  sendTyping: (recipientId: number, isTyping: boolean) => void;
}

const PersonalWSContext = createContext<PersonalWSContextValue>({
  isConnected: false,
  presenceMap: {},
  typingUsers: {},
  incomingCall: null,
  unreadCount: 0,
  clearIncomingCall: () => {},
  sendTyping: () => {},
});

export function usePersonalWS() {
  return useContext(PersonalWSContext);
}

const RECONNECT_DELAY_MS = 4000;

export function PersonalWSProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const mounted = useRef(true);

  const [isConnected, setIsConnected] = useState(false);
  const [presenceMap, setPresenceMap] = useState<Record<number, PresenceStatus>>({});
  const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const clearIncomingCall = useCallback(() => setIncomingCall(null), []);

  const sendTyping = useCallback((recipientId: number, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'dm_typing', recipientId, isTyping }));
    }
  }, []);

  const connect = useCallback(async () => {
    if (!mounted.current) return;

    try {
      const data = await customFetch<{ ticket: string }>('/me/ws-ticket');
      if (!mounted.current || !data?.ticket) return;

      const base = (() => {
        if (typeof window !== 'undefined' && window.location) {
          const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          return `${proto}//${window.location.host}`;
        }
        const domain = process.env.EXPO_PUBLIC_DOMAIN;
        return domain ? `wss://${domain}` : 'ws://localhost:8080';
      })();

      const url = `${base}/api/ws?scope=personal&ticket=${data.ticket}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mounted.current) { ws.close(); return; }
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        if (mounted.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = () => { ws.close(); };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as { type: string; [k: string]: unknown };
          handleMessage(msg);
        } catch { /* ignore */ }
      };
    } catch {
      if (mounted.current) {
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMessage(msg: { type: string; [k: string]: unknown }) {
    switch (msg.type) {
      case 'notification': {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        setUnreadCount((c) => c + 1);
        break;
      }
      case 'dm': {
        const dm = msg.message as { senderId: number } | undefined;
        if (dm?.senderId) {
          queryClient.invalidateQueries({ queryKey: ['messages', dm.senderId] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          setUnreadCount((c) => c + 1);
        }
        break;
      }
      case 'dm_read': {
        const byUserId = msg.byUserId as number | undefined;
        if (byUserId) {
          queryClient.invalidateQueries({ queryKey: ['messages', byUserId] });
        }
        break;
      }
      case 'dm_typing': {
        const { fromUserId, isTyping } = msg as { fromUserId: number; isTyping: boolean };
        if (!fromUserId) break;
        setTypingUsers((prev) => ({ ...prev, [fromUserId]: isTyping }));
        // Auto-clear after 4s in case stop event is missed
        if (isTyping) {
          if (typingTimers.current[fromUserId]) clearTimeout(typingTimers.current[fromUserId]);
          typingTimers.current[fromUserId] = setTimeout(() => {
            setTypingUsers((prev) => ({ ...prev, [fromUserId]: false }));
          }, 4000);
        } else {
          if (typingTimers.current[fromUserId]) {
            clearTimeout(typingTimers.current[fromUserId]);
            delete typingTimers.current[fromUserId];
          }
        }
        break;
      }
      case 'presence_update': {
        const { userId, status } = msg as { userId: number; status: PresenceStatus };
        setPresenceMap((prev) => ({ ...prev, [userId]: status }));
        break;
      }
      case 'incoming_call': {
        setIncomingCall({
          sessionId: msg.sessionId as number,
          friendshipId: (msg.friendshipId as number) ?? 0,
          callerId: msg.callerId as number,
          callerHandle: msg.callerHandle as string,
          callerColor: msg.callerColor as string,
        });
        break;
      }
      case 'call_declined': {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        break;
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    connect();
    return () => {
      mounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      Object.values(typingTimers.current).forEach(clearTimeout);
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    customFetch<{ count: number }>('/notifications/unread-count')
      .then((d) => { if (d?.count !== undefined) setUnreadCount(d.count); })
      .catch(() => {});
  }, []);

  return (
    <PersonalWSContext.Provider
      value={{ isConnected, presenceMap, typingUsers, incomingCall, unreadCount, clearIncomingCall, sendTyping }}
    >
      {children}
    </PersonalWSContext.Provider>
  );
}
