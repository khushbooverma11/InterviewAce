import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { AUTH_ENABLED } from '@/app/_layout';
import {
  useCreateDiscussPost,
  getListDiscussPostsQueryKey,
} from '@workspace/api-client-react';
import type { DiscussPostInputType } from '@workspace/api-client-react';

const POST_TYPES: { value: DiscussPostInputType; label: string; icon: string; color: string; description: string }[] = [
  { value: 'question',   label: 'Question',   icon: 'help-circle',     color: '#f59e0b', description: 'Ask the community for help' },
  { value: 'discussion', label: 'Discussion', icon: 'message-circle',  color: '#2f95dc', description: 'Start a conversation' },
  { value: 'resource',   label: 'Resource',   icon: 'bookmark',        color: '#10b981', description: 'Share a useful resource' },
];

const TOPIC_SUGGESTIONS = [
  'Arrays', 'Trees', 'Graphs', 'Dynamic Programming',
  'System Design', 'JavaScript', 'Python', 'React', 'SQL', 'Binary Search',
];

export default function NewPostScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [type, setType] = useState<DiscussPostInputType>('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topicTag, setTopicTag] = useState('');
  // Local loading state used in demo mode (no real mutation pending)
  const [demoLoading, setDemoLoading] = useState(false);

  const createPost = useCreateDiscussPost();

  const isPending = demoLoading || createPost.isPending;
  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (!AUTH_ENABLED) {
      // Demo mode: show a realistic loading state, then go back to the feed.
      setDemoLoading(true);
      setTimeout(() => {
        setDemoLoading(false);
        // Go back to the discuss tab — no real post ID exists yet.
        router.replace('/(tabs)/discuss');
      }, 900);
      return;
    }

    createPost.mutate(
      {
        data: {
          type,
          title: title.trim(),
          content: content.trim(),
          topicTag: topicTag.trim() || undefined,
        },
      },
      {
        onSuccess: (post) => {
          queryClient.invalidateQueries({ queryKey: getListDiscussPostsQueryKey() });
          router.replace(`/discuss/${post.id}`);
        },
        onError: () => {
          Alert.alert('Error', 'Failed to create post. Please try again.');
        },
      },
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'New Post',
          presentation: 'modal',
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { color: colors.foreground, fontWeight: '700' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.headerBtn, { opacity: canSubmit ? 1 : 0.35 }]}
              activeOpacity={0.8}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.submitText, { color: colors.primary }]}>Post</Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post type selector */}
        <Text style={[styles.label, { color: colors.foreground }]}>Type</Text>
        <View style={styles.typeRow}>
          {POST_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setType(t.value)}
              activeOpacity={0.8}
              style={[
                styles.typeCard,
                {
                  borderColor: type === t.value ? t.color : colors.border,
                  backgroundColor: type === t.value ? t.color + '15' : colors.card,
                },
              ]}
            >
              <Feather
                name={t.icon as any}
                size={20}
                color={type === t.value ? t.color : colors.mutedForeground}
              />
              <Text style={[styles.typeLabel, { color: type === t.value ? t.color : colors.foreground }]}>
                {t.label}
              </Text>
              <Text style={[styles.typeDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                {t.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <Text style={[styles.label, { color: colors.foreground }]}>Title</Text>
        <TextInput
          style={[styles.titleInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
          placeholder="Write a clear, specific title…"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          returnKeyType="next"
        />
        <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{title.length}/120</Text>

        {/* Content */}
        <Text style={[styles.label, { color: colors.foreground }]}>Content</Text>
        <TextInput
          style={[styles.contentInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
          placeholder={
            type === 'question'
              ? "Describe your problem in detail. Include what you've tried\u2026"
              : type === 'resource'
              ? "Share the resource link and why it's helpful\u2026"
              : "What\u2019s on your mind? Share your thoughts\u2026"
          }
          placeholderTextColor={colors.mutedForeground}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />
        <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{content.length}/2000</Text>

        {/* Topic tag */}
        <Text style={[styles.label, { color: colors.foreground }]}>
          Topic Tag <Text style={[styles.optional, { color: colors.mutedForeground }]}>(optional)</Text>
        </Text>
        <TextInput
          style={[styles.tagInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
          placeholder="e.g. Dynamic Programming"
          placeholderTextColor={colors.mutedForeground}
          value={topicTag}
          onChangeText={setTopicTag}
          maxLength={40}
          returnKeyType="done"
        />

        {/* Quick topic suggestions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestions}
        >
          {TOPIC_SUGGESTIONS.filter((t) => t !== topicTag).map((topic) => (
            <TouchableOpacity
              key={topic}
              onPress={() => setTopicTag(topic)}
              activeOpacity={0.7}
              style={[styles.suggestionChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Text style={[styles.suggestionText, { color: colors.mutedForeground }]}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 6 },
  label: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, letterSpacing: 0.3 },
  optional: { fontWeight: '400' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  typeLabel: { fontSize: 12, fontWeight: '700' },
  typeDesc: { fontSize: 10, textAlign: 'center' },
  titleInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  contentInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 140,
    lineHeight: 22,
  },
  tagInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  suggestions: { gap: 8, paddingVertical: 4 },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  suggestionText: { fontSize: 12, fontWeight: '500' },
  headerBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  cancelText: { fontSize: 16, fontWeight: '400' },
  submitText: { fontSize: 16, fontWeight: '700' },
});
