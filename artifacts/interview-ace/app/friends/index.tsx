import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';
import {
  useFriends,
  useFriendRequests,
  useRespondToFriendRequest,
  useUnfriend,
  useCallFriend,
  type FriendEntry,
} from '@/hooks/useApi';
import { usePersonalWS } from '@/contexts/PersonalWSContext';

type Tab = 'friends' | 'requests';

const PRESENCE_COLORS: Record<string, string> = {
  online: '#10b981',
  in_session: '#f59e0b',
  busy: '#ef4444',
  offline: '#9ca3af',
};

function PresenceDot({ status }: { status: string }) {
  return (
    <View
      style={[
        styles.presenceDot,
        { backgroundColor: PRESENCE_COLORS[status] ?? '#9ca3af' },
      ]}
    />
  );
}

function FriendCard({ friend, onMessage, onCall, onUnfriend }: {
  friend: FriendEntry;
  onMessage: () => void;
  onCall: () => void;
  onUnfriend: () => void;
}) {
  const colors = useColors();
  const { presenceMap } = usePersonalWS();
  const livePresence = presenceMap[friend.userId] ?? friend.presence;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardLeft}>
        <View>
          <AvatarBadge handle={friend.handle} avatarColor={friend.avatarColor} size={44} />
          <PresenceDot status={livePresence} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.handle, { color: colors.foreground }]} numberOfLines={1}>
            {friend.handle}
          </Text>
          <Text style={[styles.presenceText, { color: PRESENCE_COLORS[livePresence] ?? colors.mutedForeground }]}>
            {livePresence.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={onMessage}
          style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="message-circle" size={17} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCall}
          style={[styles.actionBtn, { backgroundColor: '#10b98118' }]}
        >
          <Feather name="phone" size={17} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onUnfriend}
          style={[styles.actionBtn, { backgroundColor: '#ef444415' }]}
        >
          <Feather name="user-minus" size={17} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RequestCard({ req, onAccept, onReject }: {
  req: FriendEntry;
  onAccept: () => void;
  onReject: () => void;
}) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardLeft}>
        <AvatarBadge handle={req.handle} avatarColor={req.avatarColor} size={44} />
        <View style={styles.cardInfo}>
          <Text style={[styles.handle, { color: colors.foreground }]} numberOfLines={1}>
            {req.handle}
          </Text>
          <Text style={[styles.presenceText, { color: colors.mutedForeground }]}>
            {req.isRequester ? 'Request sent' : 'Wants to be friends'}
          </Text>
        </View>
      </View>
      {!req.isRequester && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onAccept}
            style={[styles.actionBtn, { backgroundColor: '#10b98118' }]}
          >
            <Feather name="check" size={18} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReject}
            style={[styles.actionBtn, { backgroundColor: '#ef444415' }]}
          >
            <Feather name="x" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function FriendsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('friends');

  const { data: friends = [], isLoading: friendsLoading, refetch: refetchFriends } = useFriends();
  const { data: requests = [], isLoading: reqLoading, refetch: refetchReqs } = useFriendRequests();
  const respond = useRespondToFriendRequest();
  const unfriend = useUnfriend();
  const callFriend = useCallFriend();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFriends(), refetchReqs()]);
    setRefreshing(false);
  }, [refetchFriends, refetchReqs]);

  const pendingRequests = requests.filter((r) => !r.isRequester);

  const handleCall = (friend: FriendEntry) => {
    if (friend.presence === 'offline') {
      Alert.alert('Offline', `${friend.handle} is currently offline.`);
      return;
    }
    callFriend.mutate(friend.friendshipId, {
      onSuccess: (data) => router.push(`/discuss/chat/${data.sessionId}` as never),
      onError: (err) => {
        if (err.message.includes('offline')) {
          Alert.alert('Offline', `${friend.handle} is currently offline.`);
        } else {
          Alert.alert('Error', 'Could not initiate call. Try again.');
        }
      },
    });
  };

  const handleUnfriend = (friend: FriendEntry) => {
    Alert.alert(
      'Remove Friend',
      `Remove ${friend.handle} from your friends? Chat history is preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => unfriend.mutate(friend.friendshipId),
        },
      ],
    );
  };

  const isLoading = tab === 'friends' ? friendsLoading : reqLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Friends</Text>
        <TouchableOpacity
          onPress={() => router.push('/notifications' as never)}
          style={styles.headerBtn}
        >
          <Feather name="bell" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(['friends', 'requests'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? colors.primary : colors.mutedForeground },
              ]}
            >
              {t === 'requests' ? `Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}` : 'Friends'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : tab === 'friends' ? (
        <FlatList
          data={friends}
          keyExtractor={(f) => String(f.friendshipId)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="users" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No friends yet. Send a friend request after a session.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <FriendCard
              friend={item}
              onMessage={() => router.push(`/messages/${item.userId}` as never)}
              onCall={() => handleCall(item)}
              onUnfriend={() => handleUnfriend(item)}
            />
          )}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => String(r.friendshipId)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="user-check" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No pending friend requests.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <RequestCard
              req={item}
              onAccept={() => respond.mutate({ friendshipId: item.friendshipId, action: 'accept' })}
              onReject={() => respond.mutate({ friendshipId: item.friendshipId, action: 'reject' })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800' },
  headerBtn: { padding: 6 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 260 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardInfo: { flex: 1 },
  handle: { fontSize: 14, fontWeight: '600' },
  presenceText: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  presenceDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
