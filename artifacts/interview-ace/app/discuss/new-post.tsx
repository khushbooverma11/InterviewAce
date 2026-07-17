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

const CATEGORIES = [
  'DSA', 'Low Level Design (LLD)', 'High Level Design (HLD)',
  'Java', 'JavaScript', 'React', 'SQL', 'Python', 'C++', 'Other',
];

export default function NewPostScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  const createPost = useCreateDiscussPost();
  const isPending = demoLoading || createPost.isPending;
  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (!AUTH_ENABLED) {
      setDemoLoading(true);
      setTimeout(() => {
        setDemoLoading(false);
        router.replace('/(tabs)/discuss');
      }, 900);
      return;
    }

    createPost.mutate(
      {
        data: {
          type: 'question',
          title: title.trim(),
          content: content.trim(),
          topicTag: category || undefined,
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
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.label, { color: colors.foreground }]}>Title</Text>
        <TextInput
          style={[
            styles.titleInput,
            { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border },
          ]}
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
          style={[
            styles.contentInput,
            { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border },
          ]}
          placeholder="Share your thoughts, question, or resource…"
          placeholderTextColor={colors.mutedForeground}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />
        <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{content.length}/2000</Text>

        {/* Category */}
        <Text style={[styles.label, { color: colors.foreground }]}>
          Category{' '}
          <Text style={[styles.optional, { color: colors.mutedForeground }]}>(optional)</Text>
        </Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(selected ? '' : cat)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primary : 'transparent',
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#fff' : colors.mutedForeground }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 0 },
  label: {
    fontSize: 13, fontWeight: '700',
    marginTop: 20, marginBottom: 8, letterSpacing: 0.3,
  },
  optional: { fontWeight: '400' },
  titleInput: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  contentInput: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, minHeight: 160, lineHeight: 22,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
  headerBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  cancelText: { fontSize: 16, fontWeight: '400' },
  submitText: { fontSize: 16, fontWeight: '700' },
});
