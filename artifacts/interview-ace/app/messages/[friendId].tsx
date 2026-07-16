import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';
import {
  useDirectMessages,
  useSendDM,
  useFriends,
  type DirectMessage,
} from '@/hooks/useApi';
import { usePersonalWS } from '@/contexts/PersonalWSContext';

export default function DMScreen() {
  const { friendId: rawFriendId } = useLocalSearchParams<{ friendId: string }>();
  const friendId = Number(rawFriendId);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const { sendTyping } = usePersonalWS();
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [text, setText] = useState('');
  const [msgType, setMsgType] = useState<'text' | 'code'>('text');

  const { data: friends = [] } = useFriends();
  const friend = friends.find((f) => f.userId === friendId);

  const { data: messages = [], isLoading } = useDirectMessages(friendId);
  const sendDM = useSendDM();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const content = text.trim();
    if (!content) return;
    setText('');
    sendDM.mutate({ friendId, content, type: msgType });
  }, [text, friendId, msgType, sendDM]);

  const handleTyping = useCallback(
    (value: string) => {
      setText(value);
      sendTyping(friendId, true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => sendTyping(friendId, false), 2000);
    },
    [friendId, sendTyping],
  );

  const renderMessage = ({ item, index }: { item: DirectMessage; index: number }) => {
    const isMe = item.senderId !== friendId;
    const prev = messages[index - 1];
    const showDate =
      !prev ||
      new Date(item.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();

    return (
      <>
        {showDate && (
          <Text style={[styles.dateSep, { color: colors.mutedForeground }]}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          {item.type === 'code' ? (
            <View style={[styles.codeBubble, { backgroundColor: isMe ? '#1e293b' : colors.secondary }]}>
              <Text style={[styles.codeText, { color: isMe ? '#e2e8f0' : colors.foreground }]}>
                {item.content}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.textBubble,
                { backgroundColor: isMe ? colors.primary : colors.secondary },
              ]}
            >
              <Text style={[styles.msgText, { color: isMe ? '#fff' : colors.foreground }]}>
                {item.content}
              </Text>
            </View>
          )}
          <View style={[styles.meta, isMe && styles.metaRight]}>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>
              {new Date(item.createdAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isMe && (
              <Feather
                name={item.read ? 'check-circle' : 'check'}
                size={11}
                color={item.read ? colors.primary : colors.mutedForeground}
              />
            )}
          </View>
        </View>
      </>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: friend?.handle ?? 'Message',
          headerRight: () =>
            friend ? (
              <AvatarBadge handle={friend.handle} avatarColor={friend.avatarColor} size={32} />
            ) : null,
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="message-circle" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Send a message to start chatting
                </Text>
              </View>
            }
            renderItem={renderMessage}
          />
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 },
          ]}
        >
          {/* Code / text toggle */}
          <TouchableOpacity
            onPress={() => setMsgType((t) => (t === 'text' ? 'code' : 'text'))}
            style={[styles.typeBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name={msgType === 'code' ? 'code' : 'type'} size={16} color={colors.foreground} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { color: colors.foreground, backgroundColor: colors.secondary }]}
            placeholder={msgType === 'code' ? 'Paste code...' : 'Message...'}
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={handleTyping}
            multiline
            maxLength={4000}
          />

          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: text.trim() ? 1 : 0.4 }]}
            disabled={!text.trim()}
          >
            <Feather name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 8, gap: 4 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  dateSep: { textAlign: 'center', fontSize: 11, marginVertical: 8 },
  bubble: { marginBottom: 2, maxWidth: '80%' },
  bubbleMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  textBubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  msgText: { fontSize: 15, lineHeight: 20 },
  codeBubble: { borderRadius: 10, padding: 12 },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3, marginHorizontal: 4 },
  metaRight: { justifyContent: 'flex-end' },
  time: { fontSize: 10 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  typeBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 120,
    borderRadius: 19,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
