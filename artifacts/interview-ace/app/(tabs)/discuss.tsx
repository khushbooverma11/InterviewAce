import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  useListDiscussPosts,
  useToggleDiscussPostUpvote,
  useListChatSessions,
  useBlockSessionPartner,
} from '@workspace/api-client-react';
import type { DiscussPost, ChatSession } from '@workspace/api-client-react';
import { PostCard } from '@/components/discuss/PostCard';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';
import { usePersonalWS } from '@/contexts/PersonalWSContext';
import { useFriends, useSendFriendRequest } from '@/hooks/useApi';

const CATEGORIES = [
  'All', 'DSA', 'Low Level Design (LLD)', 'High Level Design (HLD)',
  'Java', 'JavaScript', 'React', 'SQL', 'Python', 'C++', 'Other',
];

const SORT_OPTIONS: { value: SortBy; label: string; icon: string }[] = [
  { value: 'newest',     label: 'Newest',     icon: 'clock' },
  { value: 'trending',   label: 'Trending',   icon: 'trending-up' },
  { value: 'unanswered', label: 'Unanswered', icon: 'message-square' },
];

type Tab = 'feed' | 'partners';
type SortBy = 'newest' | 'trending' | 'unanswered';

// ---------------------------------------------------------------------------
// Filter Bottom Sheet
// ---------------------------------------------------------------------------
function FilterSheet({
  visible,
  category,
  sortBy,
  onChangeCategory,
  onChangeSortBy,
  onClose,
}: {
  visible: boolean;
  category: string;
  sortBy: SortBy;
  onChangeCategory: (c: string) => void;
  onChangeSortBy: (s: SortBy) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(400)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const hasActiveFilters = category !== 'All' || sortBy !== 'newest';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable>
            {/* Handle */}
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Filter & Sort</Text>
              {hasActiveFilters && (
                <TouchableOpacity
                  onPress={() => { onChangeCategory('All'); onChangeSortBy('newest'); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sheetReset, { color: colors.primary }]}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category */}
            <Text style={[styles.sheetSectionLabel, { color: colors.mutedForeground }]}>CATEGORY</Text>
            <View style={styles.sheetChipGrid}>
              {CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => onChangeCategory(c)}
                    activeOpacity={0.7}
                    style={[
                      styles.sheetChip,
                      {
                        backgroundColor: active ? colors.primary : 'transparent',
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.sheetChipText, { color: active ? '#fff' : colors.mutedForeground }]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sort by */}
            <Text style={[styles.sheetSectionLabel, { color: colors.mutedForeground }]}>SORT BY</Text>
            <View style={styles.sortRow}>
              {SORT_OPTIONS.map((opt) => {
                const active = sortBy === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => onChangeSortBy(opt.value)}
                    activeOpacity={0.8}
                    style={[
                      styles.sortCard,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.primary + '12' : colors.background,
                      },
                    ]}
                  >
                    <Feather
                      name={opt.icon as any}
                      size={16}
                      color={active ? colors.primary : colors.mutedForeground}
                    />
                    <Text style={[styles.sortLabel, { color: active ? colors.primary : colors.foreground }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Apply */}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// History card
// ---------------------------------------------------------------------------
function HistoryCard({
  session,
  isFriend,
  onPress,
  onAddFriend,
  onBlock,
}: {
  session: ChatSession;
  isFriend: boolean;
  onPress: () => void;
  onAddFriend: () => void;
  onBlock: () => void;
}) {
  const colors = useColors();

  const durationLabel =
    session.durationMinutes < 60
      ? `${session.durationMinutes}m`
      : `${Math.floor(session.durationMinutes / 60)}h`;

  const dateLabel = session.endedAt
    ? new Date(session.endedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : session.startedAt
    ? new Date(session.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  const isActive = session.status === 'active';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.historyTop}>
        <AvatarBadge handle={session.partnerHandle} avatarColor={session.partnerAvatarColor} size={38} />
        <View style={styles.historyInfo}>
          <Text style={[styles.historyHandle, { color: colors.foreground }]} numberOfLines={1}>
            {session.partnerHandle}
          </Text>
          <Text style={[styles.historyTopic, { color: colors.mutedForeground }]} numberOfLines={1}>
            {session.topic}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isActive ? '#10b98118' : colors.secondary }]}>
          <Text style={[styles.statusText, { color: isActive ? '#10b981' : colors.mutedForeground }]}>
            {isActive ? 'Active' : 'Ended'}
          </Text>
        </View>
      </View>

      <View style={[styles.historyMeta, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <Feather name="clock" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{durationLabel}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{dateLabel}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name={session.chatType === 'voice' ? 'mic' : 'message-circle'} size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{session.chatType}</Text>
        </View>

        {!isActive && !isFriend && (
          <TouchableOpacity
            onPress={onAddFriend}
            style={[styles.actionChip, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` }]}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={11} color={colors.primary} />
            <Text style={[styles.actionChipText, { color: colors.primary }]}>Add Friend</Text>
          </TouchableOpacity>
        )}
        {isFriend && (
          <View style={[styles.actionChip, { backgroundColor: '#10b98115', borderColor: '#10b98140' }]}>
            <Feather name="user-check" size={11} color="#10b981" />
            <Text style={[styles.actionChipText, { color: '#10b981' }]}>Friends</Text>
          </View>
        )}
        {!isActive && (
          <TouchableOpacity
            onPress={onBlock}
            style={[styles.actionChip, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}
            activeOpacity={0.8}
          >
            <Feather name="slash" size={11} color="#ef4444" />
            <Text style={[styles.actionChipText, { color: '#ef4444' }]}>Block</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function DiscussScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unreadCount } = usePersonalWS();

  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSort, setFilterSort] = useState<SortBy>('newest');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const topicParam = filterCategory === 'All' ? undefined : filterCategory;
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts, isRefetching } =
    useListDiscussPosts(topicParam ? { topicTag: topicParam } : undefined);
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } =
    useListChatSessions();
  const { data: friends = [] } = useFriends();
  const sendFriend = useSendFriendRequest();
  const blockSession = useBlockSessionPartner();
  const toggleUpvote = useToggleDiscussPostUpvote();

  const sortedFilteredPosts = React.useMemo(() => {
    let list = posts ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q),
      );
    }
    if (filterSort === 'trending') {
      list = [...list].sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0));
    } else if (filterSort === 'unanswered') {
      list = list.filter((p) => (p.replyCount ?? 0) === 0);
    }
    // newest: API default order
    return list;
  }, [posts, search, filterSort]);

  const handleUpvote = useCallback(
    (post: DiscussPost) => { toggleUpvote.mutate({ id: post.id }); },
    [toggleUpvote],
  );

  const activeSessions = sessions?.filter((s) => s.status === 'active') ?? [];
  const pastSessions = sessions?.filter((s) => s.status === 'ended') ?? [];
  const friendUserIds = new Set(friends.map((f) => f.userId));

  const handleAddFriend = (session: ChatSession) => {
    sendFriend.mutate({ sessionId: session.id });
  };

  const handleBlockSession = (session: ChatSession) => {
    Alert.alert(
      'Block Partner',
      `Block ${session.partnerHandle}? They won't be able to match with you again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => blockSession.mutate({ id: session.id }) },
      ],
    );
  };

  const hasActiveFilters = filterCategory !== 'All' || filterSort !== 'newest';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Discuss</Text>
        <TouchableOpacity
          onPress={() => router.push('/notifications' as never)}
          style={styles.bellBtn}
        >
          <Feather name="bell" size={20} color={colors.foreground} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Segmented tabs ── */}
      <View style={[styles.segmented, { borderBottomColor: colors.border }]}>
        {(['feed', 'partners'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.segTab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.segTabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
              {tab === 'feed' ? 'Community Feed' : 'Study Partners'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Feed Tab ── */}
      {activeTab === 'feed' && (
        <>
          {/* Search + Filter row */}
          <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.searchBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="search" size={15} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search discussions…"
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setFilterSheetVisible(true)}
              activeOpacity={0.75}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: hasActiveFilters ? colors.primary + '15' : colors.secondary,
                  borderColor: hasActiveFilters ? colors.primary : colors.border,
                },
              ]}
            >
              <Feather name="sliders" size={16} color={hasActiveFilters ? colors.primary : colors.mutedForeground} />
              {hasActiveFilters && (
                <View style={[styles.filterDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          </View>

          {postsLoading ? (
            <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>
          ) : (
            <FlatList
              style={styles.flex1}
              data={sortedFilteredPosts}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
              refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchPosts} tintColor={colors.primary} />}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Feather name="message-square" size={40} color={colors.border} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    {search ? 'No posts match your search' : 'No posts yet. Be the first!'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <PostCard
                  post={item}
                  onPress={() => router.push(`/discuss/${item.id}`)}
                  onUpvote={() => handleUpvote(item)}
                />
              )}
            />
          )}

          {/* FAB */}
          <TouchableOpacity
            onPress={() => router.push('/discuss/new-post')}
            activeOpacity={0.85}
            style={[
              styles.fab,
              { backgroundColor: colors.primary, bottom: insets.bottom + 24 },
            ]}
          >
            <Feather name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      {/* ── Partners Tab ── */}
      {activeTab === 'partners' && (
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={() => null}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={<RefreshControl refreshing={sessionsLoading} onRefresh={refetchSessions} tintColor={colors.primary} />}
          ListHeaderComponent={
            <View>
              <TouchableOpacity
                onPress={() => router.push('/discuss/find-partner')}
                activeOpacity={0.85}
                style={[styles.findPartnerCard, { backgroundColor: colors.primary }]}
              >
                <View style={styles.findPartnerIcon}>
                  <Feather name="users" size={28} color="#fff" />
                </View>
                <View style={styles.findPartnerText}>
                  <Text style={styles.findPartnerTitle}>Find a Study Partner</Text>
                  <Text style={styles.findPartnerSub}>Get matched for a voice session</Text>
                </View>
                <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/friends' as never)}
                activeOpacity={0.85}
                style={[styles.friendsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.friendsIcon, { backgroundColor: '#8b5cf618' }]}>
                  <Feather name="user-check" size={20} color="#8b5cf6" />
                </View>
                <View style={styles.findPartnerText}>
                  <Text style={[styles.friendsTitle, { color: colors.foreground }]}>
                    Friends {friends.length > 0 ? `· ${friends.length}` : ''}
                  </Text>
                  <Text style={[styles.friendsSub, { color: colors.mutedForeground }]}>
                    Message or call your study friends
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>

              {activeSessions.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.activeDot, { backgroundColor: '#10b981' }]} />
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Sessions</Text>
                  </View>
                  {activeSessions.map((s) => (
                    <HistoryCard
                      key={s.id}
                      session={s}
                      isFriend={friendUserIds.has((s as unknown as { partnerId: number }).partnerId ?? -1)}
                      onPress={() => router.push(`/discuss/chat/${s.id}`)}
                      onAddFriend={() => handleAddFriend(s)}
                      onBlock={() => handleBlockSession(s)}
                    />
                  ))}
                </>
              )}

              {pastSessions.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Feather name="clock" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>History</Text>
                </View>
              )}
              {pastSessions.map((s) => (
                <HistoryCard
                  key={s.id}
                  session={s}
                  isFriend={friendUserIds.has((s as unknown as { partnerId: number }).partnerId ?? -1)}
                  onPress={() => router.push(`/discuss/chat/${s.id}`)}
                  onAddFriend={() => handleAddFriend(s)}
                  onBlock={() => handleBlockSession(s)}
                />
              ))}

              {sessions?.length === 0 && !sessionsLoading && (
                <View style={styles.empty}>
                  <Feather name="users" size={40} color={colors.border} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No sessions yet. Find a study partner to get started!
                  </Text>
                </View>
              )}
            </View>
          }
        />
      )}

      {/* Filter bottom sheet */}
      <FilterSheet
        visible={filterSheetVisible}
        category={filterCategory}
        sortBy={filterSort}
        onChangeCategory={setFilterCategory}
        onChangeSortBy={setFilterSort}
        onClose={() => setFilterSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  bellBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // Tabs
  segmented: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  segTab: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  segTabText: { fontSize: 13, fontWeight: '600' },

  // Search row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterBtn: {
    width: 40, height: 40,
    borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, borderRadius: 4,
  },

  // Feed list
  flex1: { flex: 1 },
  list: { padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 240 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  // Partners tab
  findPartnerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 18, marginBottom: 12,
  },
  findPartnerIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  findPartnerText: { flex: 1 },
  findPartnerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  findPartnerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  friendsCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 20,
  },
  friendsIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  friendsTitle: { fontSize: 14, fontWeight: '700' },
  friendsSub: { fontSize: 12, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },

  // History card
  historyCard: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  historyTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  historyInfo: { flex: 1 },
  historyHandle: { fontSize: 14, fontWeight: '600' },
  historyTopic: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 11, fontWeight: '600' },
  historyMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth, flexWrap: 'wrap',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  actionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 100, borderWidth: 1, marginLeft: 'auto',
  },
  actionChipText: { fontSize: 11, fontWeight: '600' },

  // Filter bottom sheet
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  sheetReset: { fontSize: 14, fontWeight: '600' },
  sheetSectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    marginBottom: 10, marginTop: 4,
  },
  sheetChipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  sheetChip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  sheetChipText: { fontSize: 13, fontWeight: '500' },
  sortRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  sortCard: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5,
  },
  sortLabel: { fontSize: 12, fontWeight: '600' },
  applyBtn: {
    height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
