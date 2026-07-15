import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  useListDiscussPosts,
  useToggleDiscussPostUpvote,
  useListChatSessions,
} from '@workspace/api-client-react';
import type { DiscussPost, ChatSession } from '@workspace/api-client-react';
import { PostCard } from '@/components/discuss/PostCard';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';

const TOPIC_FILTERS = [
  'All',
  'Arrays',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'System Design',
  'JavaScript',
  'Python',
  'React',
  'SQL',
  'Binary Search',
  'Recursion',
];

type Tab = 'feed' | 'partners';

function SessionCard({ session, onPress }: { session: ChatSession; onPress: () => void }) {
  const colors = useColors();
  const isActive = session.status === 'active';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <AvatarBadge handle={session.partnerHandle} avatarColor={session.partnerAvatarColor} size={40} />
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionHandle, { color: colors.foreground }]} numberOfLines={1}>
          {session.partnerHandle}
        </Text>
        <Text style={[styles.sessionTopic, { color: colors.mutedForeground }]} numberOfLines={1}>
          {session.topic}
        </Text>
      </View>
      <View style={[styles.sessionBadge, { backgroundColor: isActive ? '#10b98118' : colors.secondary }]}>
        <Text style={[styles.sessionBadgeText, { color: isActive ? '#10b981' : colors.mutedForeground }]}>
          {isActive ? 'Active' : 'Ended'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DiscussScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [search, setSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState('All');

  const topicParam = activeTopic === 'All' ? undefined : activeTopic;
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts, isRefetching } =
    useListDiscussPosts(topicParam ? { topicTag: topicParam } : undefined);
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } =
    useListChatSessions();

  const toggleUpvote = useToggleDiscussPostUpvote();

  const filteredPosts = posts?.filter((p) =>
    search.trim()
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase())
      : true,
  ) ?? [];

  const handleUpvote = useCallback(
    (post: DiscussPost) => {
      toggleUpvote.mutate({ id: post.id });
    },
    [toggleUpvote],
  );

  const activeSessions = sessions?.filter((s) => s.status === 'active') ?? [];
  const pastSessions = sessions?.filter((s) => s.status === 'ended') ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Discuss</Text>
        <TouchableOpacity
          onPress={() => router.push('/discuss/new-post')}
          style={[styles.headerBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.headerBtnText}>New Post</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View style={[styles.segmented, { borderBottomColor: colors.border }]}>
        {(['feed', 'partners'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.segTab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segTabText,
                { color: activeTab === tab ? colors.primary : colors.mutedForeground },
              ]}
            >
              {tab === 'feed' ? 'Community Feed' : 'Study Partners'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <>
          {/* Search */}
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
          </View>

          {/* Topic filter */}
          <View style={[styles.topicScrollContainer, { borderBottomColor: colors.border }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicScroll}
            >
              {TOPIC_FILTERS.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  onPress={() => setActiveTopic(topic)}
                  activeOpacity={0.7}
                  style={[
                    styles.topicFilterChip,
                    {
                      backgroundColor: activeTopic === topic ? colors.primary : colors.secondary,
                      borderColor: activeTopic === topic ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.topicFilterText,
                      { color: activeTopic === topic ? '#fff' : colors.mutedForeground },
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Post list */}
          {postsLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <FlatList
              style={styles.flex1}
              data={filteredPosts}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetchPosts}
                  tintColor={colors.primary}
                />
              }
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
        </>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={() => null}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={
            <RefreshControl refreshing={sessionsLoading} onRefresh={refetchSessions} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <View>
              {/* Find Partner CTA */}
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
                  <Text style={styles.findPartnerSub}>
                    Get anonymously matched for a text or voice session
                  </Text>
                </View>
                <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>

              {/* Active sessions */}
              {activeSessions.length > 0 && (
                <View style={styles.sectionHeader}>
                  <View style={[styles.activeDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Active Sessions
                  </Text>
                </View>
              )}
              {activeSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onPress={() => router.push(`/discuss/chat/${s.id}`)}
                />
              ))}

              {/* Past sessions */}
              {pastSessions.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Past Sessions
                  </Text>
                </View>
              )}
              {pastSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onPress={() => router.push(`/discuss/chat/${s.id}`)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  segmented: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  segTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segTabText: { fontSize: 13, fontWeight: '600' },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchInput: { flex: 1, fontSize: 14 },
  flex1: { flex: 1 },
  topicScrollContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 52,
    justifyContent: 'center',
  },
  topicScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  topicFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  topicFilterText: { fontSize: 12, fontWeight: '500' },
  list: { padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 240 },
  findPartnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  findPartnerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findPartnerText: { flex: 1 },
  findPartnerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  findPartnerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  sessionInfo: { flex: 1 },
  sessionHandle: { fontSize: 14, fontWeight: '600' },
  sessionTopic: { fontSize: 12, marginTop: 2 },
  sessionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  sessionBadgeText: { fontSize: 11, fontWeight: '600' },
});
