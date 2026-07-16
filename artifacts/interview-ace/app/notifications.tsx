import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type AppNotification,
} from '@/hooks/useApi';

const NOTIF_ICONS: Record<string, { name: string; color: string }> = {
  friend_request: { name: 'user-plus', color: '#3b82f6' },
  friend_accepted: { name: 'user-check', color: '#10b981' },
  new_message: { name: 'message-circle', color: '#8b5cf6' },
  incoming_call: { name: 'phone', color: '#10b981' },
  session_ended: { name: 'check-circle', color: '#f59e0b' },
  feedback_received: { name: 'star', color: '#f59e0b' },
};

const NOTIF_LABELS: Record<string, string> = {
  friend_request: 'sent you a friend request',
  friend_accepted: 'accepted your friend request',
  new_message: 'sent you a message',
  incoming_call: 'called you',
  session_ended: 'Session ended',
  feedback_received: 'Left you feedback',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifCard({ notif, onPress }: { notif: AppNotification; onPress: () => void }) {
  const colors = useColors();
  const icon = NOTIF_ICONS[notif.type] ?? { name: 'bell', color: colors.primary };
  const label = NOTIF_LABELS[notif.type] ?? notif.type;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: notif.read ? colors.card : `${colors.primary}12`,
          borderColor: notif.read ? colors.border : `${colors.primary}30`,
        },
      ]}
    >
      {/* Avatar / icon */}
      {notif.fromHandle ? (
        <View style={styles.avatarWrap}>
          <AvatarBadge handle={notif.fromHandle} avatarColor={notif.fromAvatarColor ?? '#7c6cff'} size={40} />
          <View style={[styles.iconBadge, { backgroundColor: icon.color }]}>
            <Feather name={icon.name as never} size={9} color="#fff" />
          </View>
        </View>
      ) : (
        <View style={[styles.iconCircle, { backgroundColor: `${icon.color}20` }]}>
          <Feather name={icon.name as never} size={20} color={icon.color} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.body, { color: colors.foreground }]} numberOfLines={2}>
          {notif.fromHandle ? (
            <>
              <Text style={{ fontWeight: '700' }}>{notif.fromHandle}</Text>
              {' '}{label}
            </>
          ) : label}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {timeAgo(notif.createdAt)}
        </Text>
      </View>

      {!notif.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: notifs = [], isLoading, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const handlePress = (notif: AppNotification) => {
    if (!notif.read) markRead.mutate(notif.id);

    // Navigate to relevant screen
    if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
      router.push('/friends' as never);
    } else if (notif.type === 'new_message' && notif.fromUserId) {
      router.push(`/messages/${notif.fromUserId}` as never);
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () =>
            unreadCount > 0 ? (
              <TouchableOpacity onPress={() => markAll.mutate()} style={styles.markAllBtn}>
                <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={notifs}
            keyExtractor={(n) => String(n.id)}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="bell-off" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No notifications yet
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <NotifCard notif={item} onPress={() => handlePress(item)} />
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 8 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  avatarWrap: { position: 'relative' },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 3 },
  body: { fontSize: 14, lineHeight: 19 },
  time: { fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  markAllBtn: { paddingHorizontal: 4 },
  markAllText: { fontSize: 13, fontWeight: '600' },
});
