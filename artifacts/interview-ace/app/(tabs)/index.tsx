import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { TRACKS, getTotalLessons } from '@/constants/learn-data';

function TrackCard({ track }: { track: typeof TRACKS[0] }) {
  const colors = useColors();
  const router = useRouter();
  const { completedCount } = useLearnProgress();

  const allLessonIds = track.chapters.flatMap((ch) =>
    ch.lessons.map((l) => l.id),
  );
  const total = allLessonIds.length;
  const done = completedCount(allLessonIds);
  const pct = total > 0 ? done / total : 0;
  const hasStarted = done > 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/learn/${track.id}`)}
      activeOpacity={0.88}
      style={[styles.trackCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Color accent bar */}
      <View style={[styles.trackAccent, { backgroundColor: track.color }]} />

      <View style={styles.trackBody}>
        {/* Icon + title row */}
        <View style={styles.trackHeaderRow}>
          <View style={[styles.trackIconBg, { backgroundColor: track.color + '20' }]}>
            <Feather name={track.icon as any} size={20} color={track.color} />
          </View>
          <View style={styles.trackTitleBlock}>
            <Text style={[styles.trackShortTitle, { color: track.color }]}>
              {track.shortTitle}
            </Text>
            <Text style={[styles.trackTitle, { color: colors.foreground }]} numberOfLines={1}>
              {track.title}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </View>

        {/* Description */}
        <Text style={[styles.trackDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {track.description}
        </Text>

        {/* Stats row */}
        <View style={styles.trackStats}>
          <View style={styles.statItem}>
            <Feather name="book-open" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {track.chapters.length} chapters
            </Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="file-text" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {total} lessons
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: track.color, width: `${pct * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
            {done}/{total}
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => router.push(`/learn/${track.id}`)}
          activeOpacity={0.85}
          style={[styles.trackCta, { backgroundColor: track.color }]}
        >
          <Text style={styles.trackCtaText}>
            {!hasStarted ? 'Start Learning' : done === total ? 'Review Track' : 'Continue'}
          </Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completedCount } = useLearnProgress();

  const allIds = TRACKS.flatMap((t) =>
    t.chapters.flatMap((ch) => ch.lessons.map((l) => l.id)),
  );
  const totalAll = allIds.length;
  const doneAll = completedCount(allIds);

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
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Learn</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {doneAll}/{totalAll} lessons completed
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section label */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          LEARNING TRACKS
        </Text>

        {TRACKS.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}

        {/* Tip card */}
        <View style={[styles.tipCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="zap" size={16} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
            Tap any lesson to read the concept, see code examples, and mark it complete.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: 2 },
  scroll: { padding: 16, gap: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
    marginLeft: 2,
  },
  trackCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  trackAccent: { height: 4, width: '100%' },
  trackBody: { padding: 16, gap: 10 },
  trackHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trackIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTitleBlock: { flex: 1 },
  trackShortTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  trackTitle: { fontSize: 16, fontWeight: '700', marginTop: 1 },
  trackDesc: { fontSize: 13, lineHeight: 19 },
  trackStats: { flexDirection: 'row', gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 100 },
  progressLabel: { fontSize: 11, fontWeight: '600', minWidth: 30, textAlign: 'right' },
  trackCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 2,
  },
  trackCtaText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
