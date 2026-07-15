import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ActionSheetIOS,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import {
  useGetChatSession,
  useListSessionMessages,
  useSendSessionMessage,
  useEndChatSession,
  useReportChatSession,
  useBlockSessionPartner,
  getListSessionMessagesQueryKey,
  getGetChatSessionQueryKey,
} from '@workspace/api-client-react';
import type { ChatMessageInputType } from '@workspace/api-client-react';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';
import { MessageBubble } from '@/components/discuss/MessageBubble';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'off_topic', label: 'Off-topic' },
  { value: 'other', label: 'Other' },
] as const;

export default function ChatSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList>(null);

  const [text, setText] = useState('');
  const [msgType, setMsgType] = useState<ChatMessageInputType>('text');

  const { data: session, isLoading: sessionLoading } = useGetChatSession(sessionId);
  const { data: messages = [], isLoading: msgsLoading } = useListSessionMessages(sessionId, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: {
      enabled: !!sessionId,
      refetchInterval: session?.status === 'active' ? 3000 : false,
    } as any,
  });

  const sendMsg = useSendSessionMessage();
  const endSession = useEndChatSession();
  const reportSession = useReportChatSession();
  const blockPartner = useBlockSessionPartner();

  const isActive = session?.status === 'active';

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const content = text.trim();
    if (!content || !isActive) return;
    setText('');
    sendMsg.mutate(
      { id: sessionId, data: { type: msgType, content } },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: getListSessionMessagesQueryKey(sessionId) }),
      },
    );
  }, [text, msgType, sessionId, isActive, sendMsg, queryClient]);

  const handleEnd = () => {
    Alert.alert('End Session', 'Are you sure you want to end this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: () =>
          endSession.mutate(
            { id: sessionId },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getGetChatSessionQueryKey(sessionId) });
                queryClient.invalidateQueries({ queryKey: getListSessionMessagesQueryKey(sessionId) });
              },
            },
          ),
      },
    ]);
  };

  const handleReport = (reason: string) => {
    reportSession.mutate(
      { id: sessionId, data: { reason: reason as any } },
      { onSuccess: () => Alert.alert('Reported', 'Thank you. Our team will review this.') },
    );
  };

  const handleBlock = () => {
    Alert.alert('Block Partner', 'They will no longer be able to match with you.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () =>
          blockPartner.mutate(
            { id: sessionId },
            { onSuccess: () => router.back() },
          ),
      },
    ]);
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Report Partner', 'Block Partner'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (idx) => {
          if (idx === 1) showReportSheet();
          if (idx === 2) handleBlock();
        },
      );
    } else {
      Alert.alert('Options', '', [
        { text: 'Report Partner', onPress: showReportSheet },
        { text: 'Block Partner', style: 'destructive', onPress: handleBlock },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const showReportSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...REPORT_REASONS.map((r) => r.label)],
          cancelButtonIndex: 0,
          destructiveButtonIndex: REPORT_REASONS.findIndex((r) => r.value === 'harassment') + 1,
        },
        (idx) => {
          if (idx > 0) handleReport(REPORT_REASONS[idx - 1].value);
        },
      );
    } else {
      Alert.alert(
        'Report Reason',
        '',
        ([...REPORT_REASONS.map((r) => ({ text: r.label, onPress: () => handleReport(r.value) })), { text: 'Cancel', onPress: () => {} }] as any),
      );
    }
  };

  if (sessionLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Session not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <AvatarBadge
                handle={session.partnerHandle}
                avatarColor={session.partnerAvatarColor}
                size={34}
              />
              <View>
                <Text style={[styles.headerHandle, { color: colors.foreground }]} numberOfLines={1}>
                  {session.partnerHandle}
                </Text>
                <Text style={[styles.headerTopic, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {session.topic} · {session.durationMinutes}min
                </Text>
              </View>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {isActive && (
                <TouchableOpacity onPress={handleEnd} style={styles.endBtn} activeOpacity={0.8}>
                  <Text style={[styles.endText, { color: colors.destructive }]}>End</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={showOptions} style={styles.moreBtn} activeOpacity={0.7}>
                <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Ended banner */}
      {!isActive && (
        <View style={[styles.endedBanner, { backgroundColor: colors.secondary, borderBottomColor: colors.border }]}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.endedText, { color: colors.mutedForeground }]}>This session has ended</Text>
        </View>
      )}

      {/* Messages */}
      {msgsLoading && messages.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: insets.bottom + (isActive ? 72 : 16) },
          ]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <AvatarBadge
                handle={session.partnerHandle}
                avatarColor={session.partnerAvatarColor}
                size={52}
              />
              <Text style={[styles.emptyChatTitle, { color: colors.foreground }]}>
                You're connected with {session.partnerHandle}
              </Text>
              <Text style={[styles.emptyChatSub, { color: colors.mutedForeground }]}>
                Topic: {session.topic} · {session.durationMinutes} min session
              </Text>
              <Text style={[styles.emptyChatHint, { color: colors.mutedForeground }]}>
                Say hello and start collaborating!
              </Text>
            </View>
          }
          renderItem={({ item }) => <MessageBubble message={item} />}
        />
      )}

      {/* Input bar */}
      {isActive && (
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
          {/* Code/text toggle */}
          <TouchableOpacity
            onPress={() => setMsgType((t) => (t === 'text' ? 'code' : 'text'))}
            style={[
              styles.typeToggle,
              {
                backgroundColor: msgType === 'code' ? colors.primary + '18' : colors.secondary,
                borderColor: msgType === 'code' ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.typeToggleText,
                { color: msgType === 'code' ? colors.primary : colors.mutedForeground },
              ]}
            >
              {'</>'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondary,
                color: colors.foreground,
                borderColor: colors.border,
                fontFamily: msgType === 'code' ? 'monospace' : undefined,
              },
            ]}
            placeholder={msgType === 'code' ? 'Paste code here…' : 'Message…'}
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={2000}
            returnKeyType="default"
            blurOnSubmit={false}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sendMsg.isPending}
            style={[
              styles.sendBtn,
              { backgroundColor: text.trim() ? colors.primary : colors.secondary },
            ]}
            activeOpacity={0.8}
          >
            {sendMsg.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={16} color={text.trim() ? '#fff' : colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14 },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 220,
  },
  headerHandle: { fontSize: 14, fontWeight: '700' },
  headerTopic: { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  endBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  endText: { fontSize: 14, fontWeight: '600' },
  moreBtn: { padding: 6 },
  endedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  endedText: { fontSize: 12, fontWeight: '500' },
  messageList: { paddingHorizontal: 16, paddingTop: 12 },
  emptyChat: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyChatTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptyChatSub: { fontSize: 13 },
  emptyChatHint: { fontSize: 12, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  typeToggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  typeToggleText: { fontSize: 11, fontWeight: '800' },
  input: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
});
