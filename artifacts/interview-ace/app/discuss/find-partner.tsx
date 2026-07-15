import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AUTH_ENABLED } from '@/app/_layout';
import {
  useCreateMatchRequest,
  useGetMatchRequest,
  useCancelMatchRequest,
} from '@workspace/api-client-react';
import type {
  MatchRequestInputSkillLevel,
  MatchRequestInputChatType,
} from '@workspace/api-client-react';

const TOPICS = [
  'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack',
  'Binary Search', 'Linked List', 'Trees', 'Graphs',
  'Dynamic Programming', 'System Design', 'Sorting', 'Recursion',
];

const SKILL_LEVELS: { value: MatchRequestInputSkillLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: '< 3 months' },
  { value: 'intermediate', label: 'Intermediate', desc: '3–12 months' },
  { value: 'advanced', label: 'Advanced', desc: '1+ years' },
  { value: 'any', label: 'Any', desc: "Doesn't matter" },
];

const DURATIONS = [15, 30, 45, 60];

type Stage = 'configure' | 'searching' | 'matched';

function PulsingRing({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.5, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1000, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        { borderColor: color, transform: [{ scale }], opacity },
      ]}
    />
  );
}

export default function FindPartnerScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [stage, setStage] = useState<Stage>('configure');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [skillLevel, setSkillLevel] = useState<MatchRequestInputSkillLevel>('any');
  const [duration, setDuration] = useState(30);
  const [chatType, setChatType] = useState<MatchRequestInputChatType>('text');
  const [matchId, setMatchId] = useState<number | null>(null);

  // Demo-mode timer ref — used when AUTH is not configured
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createMatch = useCreateMatchRequest();
  const cancelMatch = useCancelMatchRequest();

  const { data: matchStatus } = useGetMatchRequest(matchId ?? 0, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: {
      enabled: AUTH_ENABLED && stage === 'searching' && matchId !== null,
      refetchInterval: 2000,
    } as any,
  });

  // Live API: transition when server reports a match
  useEffect(() => {
    if (!AUTH_ENABLED) return;
    if (matchStatus?.status === 'matched' && matchStatus.sessionId) {
      setStage('matched');
    } else if (matchStatus?.status === 'expired' || matchStatus?.status === 'cancelled') {
      setStage('configure');
      setMatchId(null);
      Alert.alert('Not Found', 'No partner found this time. Try again!');
    }
  }, [matchStatus]);

  // Cleanup demo timer on unmount
  useEffect(() => () => { if (demoTimerRef.current) clearTimeout(demoTimerRef.current); }, []);

  const handleFind = () => {
    if (!AUTH_ENABLED) {
      // Demo mode: animate through searching → matched without a real API call
      setStage('searching');
      demoTimerRef.current = setTimeout(() => setStage('matched'), 3500);
      return;
    }

    createMatch.mutate(
      {
        data: { topic, skillLevel, chatType, durationMinutes: duration, anonymous: true },
      },
      {
        onSuccess: (result) => {
          setMatchId(result.id);
          if (result.status === 'matched' && result.sessionId) {
            setStage('matched');
          } else {
            setStage('searching');
          }
        },
        onError: () => Alert.alert('Error', 'Failed to start search. Please try again.'),
      },
    );
  };

  const handleCancel = () => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    if (matchId && AUTH_ENABLED) cancelMatch.mutate({ id: matchId });
    setStage('configure');
    setMatchId(null);
  };

  const handleStartChat = () => {
    if (!AUTH_ENABLED) {
      Alert.alert(
        'Backend Required',
        'Live chat sessions need the API server and Clerk authentication to be configured. Add your CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY secrets to enable this feature.',
        [{ text: 'OK' }],
      );
      return;
    }
    const sessionId = matchStatus?.sessionId;
    if (sessionId) router.replace(`/discuss/chat/${sessionId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Find Study Partner' }} />

      {/* CONFIGURE STAGE */}
      {stage === 'configure' && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header banner */}
          <View style={[styles.banner, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30', borderWidth: 1 }]}>
            <View style={[styles.bannerIcon, { backgroundColor: colors.primary + '25' }]}>
              <Feather name="users" size={22} color={colors.primary} />
            </View>
            <View style={styles.bannerText}>
              <Text style={[styles.bannerTitle, { color: colors.foreground }]}>Anonymous Matching</Text>
              <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
                Your real name is never shared. You'll appear as your anonymous handle.
              </Text>
            </View>
          </View>

          {/* Topic */}
          <Text style={[styles.label, { color: colors.foreground }]}>Topic</Text>
          <View style={styles.chipGrid}>
            {TOPICS.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTopic(t)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  {
                    backgroundColor: topic === t ? colors.primary : colors.secondary,
                    borderColor: topic === t ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: topic === t ? '#fff' : colors.mutedForeground }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Skill level */}
          <Text style={[styles.label, { color: colors.foreground }]}>Your Skill Level</Text>
          <View style={styles.skillRow}>
            {SKILL_LEVELS.map((s) => (
              <TouchableOpacity
                key={s.value}
                onPress={() => setSkillLevel(s.value)}
                activeOpacity={0.8}
                style={[
                  styles.skillCard,
                  {
                    borderColor: skillLevel === s.value ? colors.primary : colors.border,
                    backgroundColor: skillLevel === s.value ? colors.primary + '15' : colors.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.skillLabel,
                    { color: skillLevel === s.value ? colors.primary : colors.foreground },
                  ]}
                >
                  {s.label}
                </Text>
                <Text style={[styles.skillDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <Text style={[styles.label, { color: colors.foreground }]}>Session Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDuration(d)}
                activeOpacity={0.8}
                style={[
                  styles.durationBtn,
                  {
                    borderColor: duration === d ? colors.primary : colors.border,
                    backgroundColor: duration === d ? colors.primary : colors.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    { color: duration === d ? '#fff' : colors.mutedForeground },
                  ]}
                >
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chat type */}
          <Text style={[styles.label, { color: colors.foreground }]}>Chat Type</Text>
          <View style={styles.chatTypeRow}>
            {(['text', 'voice'] as MatchRequestInputChatType[]).map((ct) => (
              <TouchableOpacity
                key={ct}
                onPress={() => setChatType(ct)}
                activeOpacity={0.8}
                style={[
                  styles.chatTypeCard,
                  {
                    borderColor: chatType === ct ? colors.primary : colors.border,
                    backgroundColor: chatType === ct ? colors.primary + '15' : colors.card,
                  },
                ]}
              >
                <Feather
                  name={ct === 'text' ? 'message-square' : 'mic'}
                  size={22}
                  color={chatType === ct ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.chatTypeLabel,
                    { color: chatType === ct ? colors.primary : colors.foreground },
                  ]}
                >
                  {ct === 'text' ? 'Text Chat' : 'Voice Chat'}
                </Text>
                {ct === 'voice' && (
                  <Text style={[styles.voiceBadge, { color: colors.mutedForeground }]}>Beta</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleFind}
            disabled={createMatch.isPending}
            style={[styles.findBtn, { backgroundColor: colors.primary, opacity: createMatch.isPending ? 0.7 : 1 }]}
            activeOpacity={0.85}
          >
            {createMatch.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="search" size={18} color="#fff" />
                <Text style={styles.findBtnText}>Find Partner</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* SEARCHING STAGE */}
      {stage === 'searching' && (
        <View style={styles.centeredContainer}>
          <View style={styles.pulseContainer}>
            <PulsingRing color={colors.primary} />
            <PulsingRing color={colors.primary} />
            <View style={[styles.pulseCenter, { backgroundColor: colors.primary + '25' }]}>
              <Feather name="users" size={36} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.searchingTitle, { color: colors.foreground }]}>Looking for a partner…</Text>
          <View style={[styles.topicPill, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.searchingTopic, { color: colors.primary }]}>{topic}</Text>
          </View>
          <Text style={[styles.searchingSub, { color: colors.mutedForeground }]}>
            We'll match you with someone at a similar skill level
          </Text>
          <TouchableOpacity
            onPress={handleCancel}
            style={[styles.outlineBtn, { borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.outlineBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MATCHED STAGE */}
      {stage === 'matched' && (
        <View style={styles.centeredContainer}>
          <View style={[styles.matchedIcon, { backgroundColor: '#10b98120' }]}>
            <Feather name="check-circle" size={52} color="#10b981" />
          </View>
          <Text style={[styles.matchedTitle, { color: colors.foreground }]}>Partner Found!</Text>
          <Text style={[styles.matchedSub, { color: colors.mutedForeground }]}>
            You've been anonymously matched for a {duration}-minute session on:
          </Text>
          <View style={[styles.topicPill, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.matchedTopicText, { color: colors.primary }]}>{topic}</Text>
          </View>
          <TouchableOpacity
            onPress={handleStartChat}
            style={[styles.findBtn, { backgroundColor: '#10b981', marginTop: 8 }]}
            activeOpacity={0.85}
          >
            <Feather name="message-circle" size={18} color="#fff" />
            <Text style={styles.findBtnText}>Start Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.textBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.textBtnText, { color: colors.mutedForeground }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 4 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  bannerSub: { fontSize: 12, lineHeight: 17 },
  label: { fontSize: 13, fontWeight: '700', marginTop: 20, marginBottom: 10, letterSpacing: 0.3 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '500' },
  skillRow: { flexDirection: 'row', gap: 8 },
  skillCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  skillLabel: { fontSize: 12, fontWeight: '700' },
  skillDesc: { fontSize: 10, textAlign: 'center' },
  durationRow: { flexDirection: 'row', gap: 10 },
  durationBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: { fontSize: 14, fontWeight: '700' },
  chatTypeRow: { flexDirection: 'row', gap: 12 },
  chatTypeCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  chatTypeLabel: { fontSize: 13, fontWeight: '700' },
  voiceBadge: { fontSize: 10, fontStyle: 'italic' },
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  findBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  pulseContainer: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  pulseCenter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingTitle: { fontSize: 22, fontWeight: '800' },
  topicPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  searchingTopic: { fontSize: 14, fontWeight: '700' },
  searchingSub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  outlineBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    marginTop: 8,
  },
  outlineBtnText: { fontSize: 14, fontWeight: '600' },
  matchedIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  matchedTitle: { fontSize: 26, fontWeight: '800' },
  matchedSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  matchedTopicText: { fontSize: 15, fontWeight: '700' },
  textBtn: { marginTop: 4, padding: 8 },
  textBtnText: { fontSize: 14 },
});
