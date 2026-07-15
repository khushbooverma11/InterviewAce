import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AvatarBadge } from './AvatarBadge';
import { TopicChip } from './TopicChip';
import type { DiscussPost } from '@workspace/api-client-react';

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

interface PostCardProps {
  post: DiscussPost;
  onPress: () => void;
  onUpvote: () => void;
}

export function PostCard({ post, onPress, onUpvote }: PostCardProps) {
  const colors = useColors();
  const typeConfig = POST_TYPE_CONFIG[post.type] ?? POST_TYPE_CONFIG.discussion;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Author row */}
      <View style={styles.authorRow}>
        <AvatarBadge handle={post.authorHandle} avatarColor={post.avatarColor} size={32} />
        <View style={styles.authorMeta}>
          <Text style={[styles.handle, { color: colors.foreground }]} numberOfLines={1}>
            {post.authorHandle}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            {timeAgo(post.createdAt)}
          </Text>
        </View>
        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '18' }]}>
          <Text style={[styles.typeLabel, { color: typeConfig.color }]}>{typeConfig.label}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {post.title}
      </Text>

      {/* Content preview */}
      <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
        {post.content}
      </Text>

      {/* Topic tag */}
      {post.topicTag ? (
        <View style={styles.topicRow}>
          <TopicChip label={post.topicTag} small />
        </View>
      ) : null}

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation?.(); onUpvote(); }}
          activeOpacity={0.7}
          style={styles.footerAction}
        >
          <Feather
            name="arrow-up"
            size={15}
            color={post.isUpvotedByMe ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              styles.footerCount,
              { color: post.isUpvotedByMe ? colors.primary : colors.mutedForeground },
            ]}
          >
            {post.upvoteCount}
          </Text>
        </TouchableOpacity>

        <View style={styles.footerAction}>
          <Feather name="message-circle" size={15} color={colors.mutedForeground} />
          <Text style={[styles.footerCount, { color: colors.mutedForeground }]}>
            {post.commentCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  authorMeta: {
    flex: 1,
  },
  handle: {
    fontSize: 13,
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 6,
  },
  preview: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  topicRow: {
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerCount: {
    fontSize: 13,
    fontWeight: '500',
  },
});
