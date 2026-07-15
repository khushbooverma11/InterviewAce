import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { ChatMessage } from '@workspace/api-client-react';

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const colors = useColors();

  if (message.type === 'system') {
    return (
      <View style={styles.systemRow}>
        <Text style={[styles.systemText, { color: colors.mutedForeground }]}>
          {message.content}
        </Text>
      </View>
    );
  }

  const isMine = message.isMine;
  const isCode = message.type === 'code';

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View
        style={[
          styles.bubble,
          isMine
            ? [styles.bubbleMine, { backgroundColor: colors.primary }]
            : [styles.bubbleTheirs, { backgroundColor: colors.card, borderColor: colors.border }],
          isCode && styles.codeBubble,
        ]}
      >
        {isCode && (
          <Text
            style={[
              styles.codeBadge,
              { color: isMine ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {'</> Code'}
          </Text>
        )}
        <Text
          style={[
            isCode ? styles.codeContent : styles.textContent,
            { color: isMine ? colors.primaryForeground : colors.foreground },
          ]}
        >
          {message.content}
        </Text>
      </View>
      <Text style={[styles.time, { color: colors.mutedForeground }]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 3,
    maxWidth: '80%',
  },
  rowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  codeBubble: {
    borderRadius: 10,
  },
  codeBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    opacity: 0.7,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textContent: {
    fontSize: 15,
    lineHeight: 21,
  },
  codeContent: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  time: {
    fontSize: 10,
    marginTop: 3,
    marginHorizontal: 2,
  },
  systemRow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
