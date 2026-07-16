/**
 * Custom React Query hooks for features not in the generated API client.
 * Uses customFetch from @workspace/api-client-react for auth + baseUrl handling.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FriendEntry {
  friendshipId: number;
  userId: number;
  handle: string;
  avatarColor: string;
  status: 'pending' | 'accepted' | 'rejected';
  isRequester: boolean;
  presence: 'online' | 'offline' | 'busy' | 'in_session';
  createdAt: string;
}

export interface DirectMessage {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  type: 'text' | 'code';
  read: boolean;
  createdAt: string;
}

export interface DMConversation {
  friendshipId: number;
  friendId: number;
  handle: string;
  avatarColor: string;
  lastMessage: DirectMessage | null;
}

export interface AppNotification {
  id: number;
  type: string;
  fromUserId: number | null;
  fromHandle: string | null;
  fromAvatarColor: string | null;
  refId: number | null;
  refType: string | null;
  read: boolean;
  createdAt: string;
}

export interface SessionFeedbackPayload {
  overallRating: number;
  communication?: number;
  helpfulness?: number;
  knowledge?: number;
  comments?: string;
}

// ---------------------------------------------------------------------------
// Friends
// ---------------------------------------------------------------------------

export function useFriends() {
  return useQuery<FriendEntry[]>({
    queryKey: ['friends'],
    queryFn: () => customFetch('/api/friends'),
  });
}

export function useFriendRequests() {
  return useQuery<FriendEntry[]>({
    queryKey: ['friend-requests'],
    queryFn: () => customFetch('/api/friends/requests'),
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation<FriendEntry, Error, { recipientId?: number; sessionId?: number }>({
    mutationFn: (body) => customFetch('/api/friends', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useRespondToFriendRequest() {
  const qc = useQueryClient();
  return useMutation<FriendEntry, Error, { friendshipId: number; action: 'accept' | 'reject' }>({
    mutationFn: ({ friendshipId, action }) =>
      customFetch(`/api/friends/${friendshipId}`, { method: 'PATCH', body: JSON.stringify({ action }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUnfriend() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (friendshipId) =>
      customFetch(`/api/friends/${friendshipId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  });
}

export function useCallFriend() {
  return useMutation<{ sessionId: number }, Error, number>({
    mutationFn: (friendshipId) =>
      customFetch(`/api/friends/${friendshipId}/call`, { method: 'POST' }),
  });
}

export function useDeclineCall() {
  return useMutation<void, Error, { friendshipId: number; sessionId: number }>({
    mutationFn: ({ friendshipId, sessionId }) =>
      customFetch(`/api/friends/${friendshipId}/call/decline`, {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      }),
  });
}

export function useBlockFriend() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (friendshipId) =>
      customFetch(`/api/friends/${friendshipId}/block`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  });
}

// ---------------------------------------------------------------------------
// Direct Messages
// ---------------------------------------------------------------------------

export function useDirectMessages(friendId: number) {
  return useQuery<DirectMessage[]>({
    queryKey: ['messages', friendId],
    queryFn: () => customFetch(`/api/messages/${friendId}`),
    enabled: !!friendId,
    refetchInterval: 5000, // Fallback poll in case WS misses something
  });
}

export function useDMConversations() {
  return useQuery<DMConversation[]>({
    queryKey: ['messages'],
    queryFn: () => customFetch('/api/messages'),
  });
}

export function useSendDM() {
  const qc = useQueryClient();
  return useMutation<DirectMessage, Error, { friendId: number; content: string; type?: 'text' | 'code' }>({
    mutationFn: ({ friendId, content, type = 'text' }) =>
      customFetch(`/api/messages/${friendId}`, { method: 'POST', body: JSON.stringify({ content, type }) }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['messages', vars.friendId] });
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: () => customFetch('/api/notifications'),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => customFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => customFetch('/api/notifications/read-all', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ---------------------------------------------------------------------------
// Session Feedback (enhanced)
// ---------------------------------------------------------------------------

export function useSubmitSessionFeedback() {
  return useMutation<{ ok: boolean }, Error, { sessionId: number; feedback: SessionFeedbackPayload }>({
    mutationFn: ({ sessionId, feedback }) =>
      customFetch(`/api/discuss/sessions/${sessionId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedback),
      }),
  });
}
