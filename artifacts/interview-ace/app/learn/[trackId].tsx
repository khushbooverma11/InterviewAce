import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { getTrackById } from '@/constants/learn-data';
import type { Chapter, Lesson } from '@/constants/learn-data';

const DIFFICULTY_COLOR = {
  Beginner: '#10b981',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
} as const;

function LessonRow({
  lesson,
  trackColor,
  chapterLessonCount,
  lessonIndex,
}: {
  lesson: Lesson;
  trackColor: string;
  chapterLessonCount: number;
  lessonIndex: number;
}) {
  const colors = useColors();
  const router = useRouter();
  const { isCompleted } = useLearnProgress();
  const done = isCompleted(lesson.id);
  const diffColor = DIFFICULTY_COLOR[lesson.difficulty];

  return (
    <TouchableOpacity
      onPress={() => router.push(`/learn/lesson/${lesson.id}`)}
      activeOpacity={0.85}
      style={[
        styles.lessonRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Number / check */}
      <View
        style={[
          styles.lessonNum,
          { backgroundColor: done ? trackColor + '20' : colors.secondary },
        ]}
      >
        {done ? (
          <Feather name="check" size={14} color={trackColor} />
        ) : (
          <Text style={[styles.lessonNumText, { color: colors.mutedForeground }]}>
            {String(lessonIndex + 1).padStart(2, '0')}
          </Text>
        )}
      </View>

      <View style={styles.lessonMeta}>
        <Text
          style={[styles.lessonTitle, { color: done ? colors.mutedForeground : colors.foreground }]}
          numberOfLines={1}
        >
          {lesson.title}
        </Text>
        <View style={styles.lessonBadgeRow}>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + '18' }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>
              {lesson.difficulty}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Feather name="clock" size={10} color={colors.mutedForeground} />
            <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
              {lesson.estimatedMinutes} min
            </Text>
          </View>
        </View>
      </View>

      <Feather
        name={done ? 'check-circle' : 'chevron-right'}
        size={16}
        color={done ? trackColor : colors.mutedForeground}
      />
    </TouchableOpacity>
  );
}

function ChapterSection({
  chapter,
  trackColor,
  initiallyOpen,
}: {
  chapter: Chapter;
  trackColor: string;
  initiallyOpen: boolean;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(initiallyOpen);
  const { completedCount } = useLearnProgress();
  const lessonIds = chapter.lessons.map((l) => l.id);
  const done = completedCount(lessonIds);
  const total = chapter.lessons.length;

  return (
    <View style={styles.chapterSection}>
      {/* Chapter header */}
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
        style={[styles.chapterHeader, { borderColor: colors.border }]}
      >
        <View style={styles.chapterLeft}>
          <View
            style={[
              styles.chapterIcon,
              { backgroundColor: done === total ? trackColor + '20' : colors.secondary },
            ]}
          >
            <Feather
              name={done === total ? 'check' : 'layers'}
              size={14}
              color={done === total ? trackColor : colors.mutedForeground}
            />
          </View>
          <View>
            <Text style={[styles.chapterTitle, { color: colors.foreground }]}>
              {chapter.title}
            </Text>
            <Text style={[styles.chapterMeta, { color: colors.mutedForeground }]}>
              {done}/{total} completed
            </Text>
          </View>
        </View>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.lessonList}>
          {chapter.lessons.map((lesson, i) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              trackColor={trackColor}
              chapterLessonCount={chapter.lessons.length}
              lessonIndex={i}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function TrackScreen() {
  const { trackId } = useLocalSearchParams<{ trackId: string }>();
  const track = getTrackById(trackId);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completedCount } = useLearnProgress();

  if (!track) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Track not found.</Text>
      </View>
    );
  }

  const allIds = track.chapters.flatMap((ch) => ch.lessons.map((l) => l.id));
  const done = completedCount(allIds);
  const total = allIds.length;
  const pct = total > 0 ? done / total : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: track.shortTitle,
          headerBackTitle: 'Learn',
        }}
      />

      {/* Track hero */}
      <View
        style={[styles.hero, { borderBottomColor: colors.border }]}
      >
        <View style={[styles.heroIcon, { backgroundColor: track.color + '20' }]}>
          <Feather name={track.icon as any} size={28} color={track.color} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>{track.title}</Text>
        <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
          {track.description}
        </Text>

        {/* Progress bar */}
        <View style={styles.heroProgress}>
          <View style={[styles.heroProgressTrack, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.heroProgressFill,
                { backgroundColor: track.color, width: `${pct * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.heroProgressLabel, { color: colors.mutedForeground }]}>
            {done}/{total} lessons
          </Text>
        </View>
      </View>

      {/* Chapter list */}
      <SectionList
        sections={track.chapters.map((ch) => ({ ...ch, data: [ch] }))}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
        renderSectionHeader={() => null}
        renderItem={({ item: chapter, index }) => (
          <ChapterSection
            chapter={chapter}
            trackColor={track.color}
            initiallyOpen={index === 0}
          />
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroDesc: { fontSize: 14, lineHeight: 20 },
  heroProgress: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  heroProgressTrack: { flex: 1, height: 6, borderRadius: 100, overflow: 'hidden' },
  heroProgressFill: { height: '100%', borderRadius: 100 },
  heroProgressLabel: { fontSize: 12, fontWeight: '600' },
  list: { padding: 16, gap: 12 },
  chapterSection: { marginBottom: 8 },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  chapterLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chapterIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterTitle: { fontSize: 15, fontWeight: '700' },
  chapterMeta: { fontSize: 12, marginTop: 1 },
  lessonList: { gap: 8 },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  lessonNum: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lessonNumText: { fontSize: 12, fontWeight: '700' },
  lessonMeta: { flex: 1, gap: 4 },
  lessonTitle: { fontSize: 14, fontWeight: '600' },
  lessonBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diffBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  diffText: { fontSize: 10, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timeText: { fontSize: 11 },
});
