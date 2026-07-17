import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import {
  useGetDiscussPost,
  useCreatePostComment,
  useToggleDiscussPostUpvote,
  useDeleteDiscussPost,
  getGetDiscussPostQueryKey,
  getListDiscussPostsQueryKey,
  customFetch,
} from '@workspace/api-client-react';
import type { PostComment } from '@workspace/api-client-react';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';
import { TopicChip } from '@/components/discuss/TopicChip';

const POST_TYPE_CONFIG = {
  question: { label: 'Question', color: '#f59e0b' },
  discussion: { label: 'Discussion', color: '#2f95dc' },
  resource: { label: 'Resource', color: '#10b981' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CommentRow({ comment, onDelete }: { comment: PostComment; onDelete?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.commentRow}>
      <AvatarBadge handle={comment.authorHandle} avatarColor={comment.avatarColor} size={30} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentHandle, { color: colors.foreground }]}>
            {comment.authorHandle}
          </Text>
          <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
            {timeAgo(comment.createdAt)}
          </Text>
          {comment.isMine && onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteCommentBtn} activeOpacity={0.7}>
              <Feather name="trash-2" size={13} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.commentText, { color: colors.foreground }]}>{comment.content}</Text>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);
  const [commentText, setCommentText] = useState('');

  const { data, isLoading, error } = useGetDiscussPost(postId);
  const addComment = useCreatePostComment();
  const toggleUpvote = useToggleDiscussPostUpvote();
  const deletePost = useDeleteDiscussPost();

  const post = data?.post;
  const comments = data?.comments ?? [];
  const typeConfig = post ? (POST_TYPE_CONFIG[post.type] ?? POST_TYPE_CONFIG.discussion) : null;

  const handleUpvote = () => {
    if (!post) return;
    toggleUpvote.mutate(
      { id: postId },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetDiscussPostQueryKey(postId) }) },
    );
  };

  const handleComment = () => {
    const text = commentText.trim();
    if (!text) return;
    addComment.mutate(
      { id: postId, data: { content: text } },
      {
        onSuccess: () => {
          setCommentText('');
          queryClient.invalidateQueries({ queryKey: getGetDiscussPostQueryKey(postId) });
          queryClient.invalidateQueries({ queryKey: getListDiscussPostsQueryKey() });
        },
      },
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deletePost.mutate(
            { id: postId },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getListDiscussPostsQueryKey() });
                router.back();
              },
            },
          ),
      },
    ]);
  };

  const handleDeleteComment = useCallback((commentId: number) => {
    Alert.alert('Delete Comment', 'Delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await customFetch(`/api/discuss/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
            queryClient.invalidateQueries({ queryKey: getGetDiscussPostQueryKey(postId) });
          } catch {
            Alert.alert('Error', 'Could not delete comment. Please try again.');
          }
        },
      },
    ]);
  }, [postId, queryClient]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Post not found or unavailable.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Stack.Screen
        options={{
          title: '',
          headerBackTitle: 'Back',
          headerRight: post.isMine
            ? () => (
                <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={18} color={colors.destructive} />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />

      <FlatList
        data={comments}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={[styles.list, { paddingBottom: 80 + insets.bottom }]}
        ListHeaderComponent={
          <View>
            {/* Post content */}
            <View style={[styles.postCard, { borderBottomColor: colors.border }]}>
              {/* Author */}
              <View style={styles.authorRow}>
                <AvatarBadge handle={post.authorHandle} avatarColor={post.avatarColor} size={38} />
                <View style={styles.authorMeta}>
                  <Text style={[styles.handle, { color: colors.foreground }]}>{post.authorHandle}</Text>
                  <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeAgo(post.createdAt)}</Text>
                </View>
                {typeConfig && (
                  <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '18' }]}>
                    <Text style={[styles.typeLabel, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={[styles.postTitle, { color: colors.foreground }]}>{post.title}</Text>

              {/* Content */}
              <Text style={[styles.postContent, { color: colors.foreground }]}>{post.content}</Text>

              {/* Topic */}
              {post.topicTag && (
                <View style={styles.topicRow}>
                  <TopicChip label={post.topicTag} small />
                </View>
              )}

              {/* Actions */}
              <View style={[styles.actions, { borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={handleUpvote} style={styles.actionBtn} activeOpacity={0.7}>
                  <Feather
                    name="arrow-up"
                    size={17}
                    color={post.isUpvotedByMe ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.actionCount,
                      { color: post.isUpvotedByMe ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    {post.upvoteCount} {post.upvoteCount === 1 ? 'upvote' : 'upvotes'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => inputRef.current?.focus()} style={styles.actionBtn} activeOpacity={0.7}>
                  <Feather name="message-circle" size={17} color={colors.mutedForeground} />
                  <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>
                    {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Comments header */}
            {comments.length > 0 && (
              <Text style={[styles.commentsHeader, { color: colors.foreground, borderBottomColor: colors.border }]}>
                Comments ({comments.length})
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyComments}>
            <Text style={[styles.emptyCommentsText, { color: colors.mutedForeground }]}>
              No comments yet. Start the conversation!
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.commentWrapper,
              index < comments.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}
          >
            <CommentRow comment={item} onDelete={() => handleDeleteComment(item.id)} />
          </View>
        )}
      />

      {/* Comment input */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
          placeholder="Add a comment…"
          placeholderTextColor={colors.mutedForeground}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleComment}
        />
        <TouchableOpacity
          onPress={handleComment}
          disabled={!commentText.trim() || addComment.isPending}
          style={[
            styles.sendBtn,
            { backgroundColor: commentText.trim() ? colors.primary : colors.secondary },
          ]}
          activeOpacity={0.8}
        >
          {addComment.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="send" size={16} color={commentText.trim() ? '#fff' : colors.mutedForeground} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14 },
  deleteBtn: { padding: 8 },
  list: { paddingHorizontal: 16 },
  postCard: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  authorMeta: { flex: 1 },
  handle: { fontSize: 14, fontWeight: '600' },
  time: { fontSize: 12, marginTop: 1 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  typeLabel: { fontSize: 11, fontWeight: '600' },
  postTitle: { fontSize: 19, fontWeight: '800', lineHeight: 26, marginBottom: 10 },
  postContent: { fontSize: 15, lineHeight: 23, marginBottom: 12 },
  topicRow: { marginBottom: 12 },
  actions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 13, fontWeight: '500' },
  commentsHeader: {
    fontSize: 14,
    fontWeight: '700',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  commentWrapper: { paddingVertical: 12 },
  commentRow: { flexDirection: 'row', gap: 10 },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentHandle: { fontSize: 13, fontWeight: '600' },
  commentTime: { fontSize: 11 },
  deleteCommentBtn: { marginLeft: 'auto', padding: 4 },
  commentText: { fontSize: 14, lineHeight: 20 },
  emptyComments: { paddingVertical: 32, alignItems: 'center' },
  emptyCommentsText: { fontSize: 13 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
