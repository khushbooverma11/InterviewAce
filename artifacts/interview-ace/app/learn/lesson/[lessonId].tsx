import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { getLessonById } from '@/constants/learn-data';
import type { LessonStep } from '@/constants/learn-data';

const DIFFICULTY_COLOR = {
  Beginner: '#10b981',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
} as const;

function StepCard({
  step,
  index,
  trackColor,
  initiallyOpen,
}: {
  step: LessonStep;
  index: number;
  trackColor: string;
  initiallyOpen: boolean;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(initiallyOpen);

  // Parse simple **bold** markdown
  function renderContent(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={i} style={{ fontWeight: '700', color: colors.foreground }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return (
        <Text key={i} style={{ color: colors.foreground }}>
          {part}
        </Text>
      );
    });
  }

  return (
    <View
      style={[
        styles.stepCard,
        {
          backgroundColor: colors.card,
          borderColor: open ? trackColor + '50' : colors.border,
        },
      ]}
    >
      {/* Step header */}
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
        style={styles.stepHeader}
      >
        <View style={[styles.stepNumBadge, { backgroundColor: trackColor + '20' }]}>
          <Text style={[styles.stepNumText, { color: trackColor }]}>
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>

      {open && (
        <View style={[styles.stepBody, { borderTopColor: colors.border }]}>
          <Text style={[styles.stepContent, { color: colors.foreground }]}>
            {renderContent(step.content)}
          </Text>

          {step.codeExample && (
            <View style={[styles.codeBlock, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {step.codeLanguage && (
                <View style={[styles.codeLang, { borderBottomColor: colors.border }]}>
                  <Feather name="code" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.codeLangText, { color: colors.mutedForeground }]}>
                    {step.codeLanguage}
                  </Text>
                </View>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={[styles.codeText, { color: colors.foreground }]}>
                  {step.codeExample}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const found = getLessonById(lessonId);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isCompleted, markComplete, markIncomplete } = useLearnProgress();
  const scrollRef = useRef<ScrollView>(null);

  if (!found) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Lesson not found.</Text>
      </View>
    );
  }

  const { lesson, chapter, track } = found;
  const trackColor = track.color;
  const diffColor = DIFFICULTY_COLOR[lesson.difficulty];
  const completed = isCompleted(lesson.id);

  // Prev / next lesson in same chapter
  const allLessons = track.chapters.flatMap((ch) => ch.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Chapter progress
  const chapterLessons = chapter.lessons.map((l) => l.id);
  const chapterDone = chapterLessons.filter((id) => isCompleted(id)).length;

  const handleToggleComplete = () => {
    if (completed) {
      markIncomplete(lesson.id);
    } else {
      markComplete(lesson.id);
      // Auto-advance to next lesson after a short delay
      if (nextLesson) {
        setTimeout(() => {
          router.replace(`/learn/lesson/${nextLesson.id}`);
        }, 600);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: '',
          headerBackTitle: chapter.title,
          headerRight: () => (
            <View style={styles.headerProgress}>
              <Text style={[styles.headerProgressText, { color: colors.mutedForeground }]}>
                {chapterDone}/{chapterLessons.length}
              </Text>
            </View>
          ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson meta */}
        <View style={styles.lessonMeta}>
          <Text style={[styles.chapterLabel, { color: trackColor }]}>
            {chapter.title.toUpperCase()}
          </Text>
          <Text style={[styles.lessonTitle, { color: colors.foreground }]}>
            {lesson.title}
          </Text>
          <Text style={[styles.lessonDesc, { color: colors.mutedForeground }]}>
            {lesson.description}
          </Text>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: diffColor + '18' }]}>
              <Text style={[styles.badgeText, { color: diffColor }]}>
                {lesson.difficulty}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Feather name="clock" size={11} color={colors.mutedForeground} />
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                {lesson.estimatedMinutes} min
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Feather name="layers" size={11} color={colors.mutedForeground} />
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                {lesson.steps.length} steps
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Steps */}
        <View style={styles.steps}>
          {lesson.steps.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              trackColor={trackColor}
              initiallyOpen={i === 0}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom actions bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        {/* Prev / Next navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => prevLesson && router.replace(`/learn/lesson/${prevLesson.id}`)}
            disabled={!prevLesson}
            activeOpacity={0.7}
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.secondary,
                opacity: prevLesson ? 1 : 0.3,
              },
            ]}
          >
            <Feather name="arrow-left" size={16} color={colors.foreground} />
            <Text style={[styles.navBtnText, { color: colors.foreground }]}>Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleComplete}
            activeOpacity={0.85}
            style={[
              styles.completeBtn,
              {
                backgroundColor: completed ? colors.secondary : trackColor,
                flex: 1,
              },
            ]}
          >
            {completed ? (
              <>
                <Feather name="check-circle" size={16} color={trackColor} />
                <Text style={[styles.completeBtnText, { color: trackColor }]}>Completed</Text>
              </>
            ) : (
              <>
                <Text style={styles.completeBtnText}>Mark Complete</Text>
                <Feather name="check" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nextLesson && router.replace(`/learn/lesson/${nextLesson.id}`)}
            disabled={!nextLesson}
            activeOpacity={0.7}
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.secondary,
                opacity: nextLesson ? 1 : 0.3,
              },
            ]}
          >
            <Text style={[styles.navBtnText, { color: colors.foreground }]}>Next</Text>
            <Feather name="arrow-right" size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerProgress: { paddingRight: 4 },
  headerProgressText: { fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20, gap: 0 },
  lessonMeta: { gap: 8, marginBottom: 20 },
  chapterLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  lessonTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30 },
  lessonDesc: { fontSize: 14, lineHeight: 20 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 20 },
  steps: { gap: 10 },
  stepCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  stepNumBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { fontSize: 12, fontWeight: '800' },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  stepBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
    gap: 12,
  },
  stepContent: { fontSize: 14, lineHeight: 22 },
  codeBlock: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  codeLang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  codeLangText: { fontSize: 11, fontWeight: '600' },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 19,
    padding: 12,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navBtnText: { fontSize: 13, fontWeight: '600' },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 12,
  },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
