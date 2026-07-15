import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AUTH_ENABLED } from '@/app/_layout';
import { useGetMe, useGetDashboard } from '@workspace/api-client-react';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { TRACKS } from '@/constants/learn-data';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOLVED_KEY = 'practice_solved_v1';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function AuthenticatedProfile() {
  // Clerk hook — lazy required to avoid crash when auth is disabled
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useAuth } = require('@clerk/expo');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { signOut } = useAuth();

  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: me, isLoading: meLoading } = useGetMe();
  const { data: dashboard, isLoading: dashLoading } = useGetDashboard();
  const { completedCount } = useLearnProgress();
  const [solvedCount, setSolvedCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem(SOLVED_KEY).then((raw) => {
      if (raw) {
        try {
          setSolvedCount((JSON.parse(raw) as string[]).length);
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const allLessonIds = TRACKS.flatMap((t) => t.chapters.flatMap((ch) => ch.lessons.map((l) => l.id)));
  const learnCompleted = completedCount(allLessonIds);
  const totalLessons = allLessonIds.length;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch {
            setSigningOut(false);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  if (meLoading || dashLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, flex: 1 }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const stats = dashboard?.stats;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutBtn, { borderColor: colors.border }]}
          activeOpacity={0.7}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <Feather name="log-out" size={16} color={colors.mutedForeground} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + handle */}
        {me && (
          <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AvatarBadge handle={me.anonymousHandle} avatarColor={me.avatarColor} size={64} />
            <View style={styles.identityText}>
              <Text style={[styles.handleText, { color: colors.foreground }]}>{me.anonymousHandle}</Text>
              <Text style={[styles.identityLabel, { color: colors.mutedForeground }]}>
                Your anonymous interview handle
              </Text>
              <View style={[styles.memberBadge, { backgroundColor: colors.primary + '18' }]}>
                <Feather name="star" size={11} color={colors.primary} />
                <Text style={[styles.memberBadgeText, { color: colors.primary }]}>Member</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats grid */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR PROGRESS</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Lessons"
            value={`${learnCompleted}/${totalLessons}`}
            icon="book-open"
            color="#3B82F6"
          />
          <StatCard
            label="Practice"
            value={solvedCount}
            icon="target"
            color="#10b981"
          />
          <StatCard
            label="Sessions"
            value={stats?.totalSessionsCompleted ?? 0}
            icon="message-circle"
            color="#8B5CF6"
          />
          <StatCard
            label="Posts"
            value={stats?.totalPostsCreated ?? 0}
            icon="edit-3"
            color="#F59E0B"
          />
        </View>

        {/* Recent achievements */}
        {dashboard?.recentAchievements && dashboard.recentAchievements.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACHIEVEMENTS</Text>
            <View style={[styles.achievementsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {dashboard.recentAchievements.map((ach, idx) => (
                <View
                  key={ach.id}
                  style={[
                    styles.achievementRow,
                    idx < dashboard.recentAchievements.length - 1 && {
                      borderBottomColor: colors.border,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View style={[styles.achIcon, { backgroundColor: '#f59e0b18' }]}>
                    <Feather name={(ach.iconName as any) ?? 'award'} size={16} color="#f59e0b" />
                  </View>
                  <View style={styles.achText}>
                    <Text style={[styles.achTitle, { color: colors.foreground }]}>{ach.title}</Text>
                    <Text style={[styles.achDesc, { color: colors.mutedForeground }]}>{ach.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Learn progress summary */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LEARN PROGRESS</Text>
        <View style={[styles.trackSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {TRACKS.map((track, idx) => {
            const ids = track.chapters.flatMap((ch) => ch.lessons.map((l) => l.id));
            const done = completedCount(ids);
            const total = ids.length;
            const pct = total > 0 ? done / total : 0;
            return (
              <View
                key={track.id}
                style={[
                  styles.trackProgressRow,
                  idx < TRACKS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <View style={[styles.trackDot, { backgroundColor: track.color }]} />
                <Text style={[styles.trackName, { color: colors.foreground }]}>{track.shortTitle}</Text>
                <View style={[styles.trackBar, { backgroundColor: colors.secondary }]}>
                  <View style={[styles.trackBarFill, { backgroundColor: track.color, width: `${pct * 100}%` }]} />
                </View>
                <Text style={[styles.trackPct, { color: colors.mutedForeground }]}>
                  {done}/{total}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Settings section */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.7}
            style={styles.settingsRow}
            disabled={signingOut}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={[styles.settingsRowText, { color: colors.destructive }]}>
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function GuestProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completedCount } = useLearnProgress();
  const [solvedCount, setSolvedCount] = useState(0);

  React.useEffect(() => {
    AsyncStorage.getItem(SOLVED_KEY).then((raw) => {
      if (raw) {
        try {
          setSolvedCount((JSON.parse(raw) as string[]).length);
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const allLessonIds = TRACKS.flatMap((t) => t.chapters.flatMap((ch) => ch.lessons.map((l) => l.id)));
  const learnCompleted = completedCount(allLessonIds);
  const totalLessons = allLessonIds.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Guest banner */}
        <View style={[styles.guestBanner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
          <View style={[styles.guestAvatarWrap, { backgroundColor: colors.primary + '20' }]}>
            <Feather name="user" size={28} color={colors.primary} />
          </View>
          <View style={styles.guestText}>
            <Text style={[styles.guestTitle, { color: colors.foreground }]}>Guest Mode</Text>
            <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
              Add your Clerk keys to unlock your profile, achievements, and study partner matching.
            </Text>
          </View>
        </View>

        {/* Local progress */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LOCAL PROGRESS</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Lessons" value={`${learnCompleted}/${totalLessons}`} icon="book-open" color="#3B82F6" />
          <StatCard label="Practice" value={solvedCount} icon="target" color="#10b981" />
        </View>

        {/* Learn progress */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LEARN PROGRESS</Text>
        <View style={[styles.trackSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {TRACKS.map((track, idx) => {
            const ids = track.chapters.flatMap((ch) => ch.lessons.map((l) => l.id));
            const done = completedCount(ids);
            const total = ids.length;
            const pct = total > 0 ? done / total : 0;
            return (
              <View
                key={track.id}
                style={[
                  styles.trackProgressRow,
                  idx < TRACKS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <View style={[styles.trackDot, { backgroundColor: track.color }]} />
                <Text style={[styles.trackName, { color: colors.foreground }]}>{track.shortTitle}</Text>
                <View style={[styles.trackBar, { backgroundColor: colors.secondary }]}>
                  <View style={[styles.trackBarFill, { backgroundColor: track.color, width: `${pct * 100}%` }]} />
                </View>
                <Text style={[styles.trackPct, { color: colors.mutedForeground }]}>{done}/{total}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export default function ProfileScreen() {
  if (AUTH_ENABLED) return <AuthenticatedProfile />;
  return <GuestProfile />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  signOutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 0,
  },
  // Identity card
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  identityText: { flex: 1, gap: 4 },
  handleText: { fontSize: 18, fontWeight: '800' },
  identityLabel: { fontSize: 12 },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginTop: 4,
  },
  memberBadgeText: { fontSize: 11, fontWeight: '700' },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flex: 1,
    minWidth: '44%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    alignItems: 'flex-start',
  },
  statIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12 },
  // Achievements
  achievementsCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  achievementRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  achIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  achText: { flex: 1 },
  achTitle: { fontSize: 14, fontWeight: '700' },
  achDesc: { fontSize: 12, marginTop: 2 },
  // Track progress
  trackSummaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  trackProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  trackDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  trackName: { fontSize: 13, fontWeight: '600', width: 36 },
  trackBar: { flex: 1, height: 5, borderRadius: 100, overflow: 'hidden' },
  trackBarFill: { height: '100%', borderRadius: 100 },
  trackPct: { fontSize: 11, fontWeight: '600', width: 32, textAlign: 'right' },
  // Settings
  settingsCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  settingsRowText: { fontSize: 15, fontWeight: '600' },
  // Guest
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  guestAvatarWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  guestText: { flex: 1, gap: 4 },
  guestTitle: { fontSize: 16, fontWeight: '700' },
  guestSub: { fontSize: 13, lineHeight: 18 },
});
