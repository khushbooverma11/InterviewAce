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
} from '@workspace/api-client-react';

// High-level learning tracks (DSA subtopics chosen inside the session)
const TRACKS = [
  'DSA',
  'Low Level Design (LLD)',
  'High Level Design (HLD)',
  'Java',
  'JavaScript',
  'React',
  'SQL',
  'Python',
  'C++',
  'Other',
];

// Simplified experience levels — mapped to existing API skill-level values
const EXPERIENCE_LEVELS: { value: MatchRequestInputSkillLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Fresher / Student', desc: 'Learning or in college' },
  { value: 'advanced', label: 'Experienced', desc: 'Working professional' },
];

const LANGUAGES = ['English', 'Hindi', 'Hinglish'];

// Voice is always on — no chat-type selection needed
const CHAT_TYPE = 'voice' as const;
// Duration is managed inside the session; pass a safe default to the API
const DEFAULT_DURATION = 60;

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
  const [track, setTrack] = useState(TRACKS[0]);
  const [skillLevel, setSkillLevel] = useState<MatchRequestInputSkillLevel>('beginner');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [matchId, setMatchId] = useState<number | null>(null);

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

  useEffect(() => {
    if (!AUTH_ENABLED) return;
    if (matchStatus?.status === 'matched' && matchStatus.sessionId) {
      router.replace(`/discuss/chat/${matchStatus.sessionId}`);
    }
  }, [AUTH_ENABLED, matchStatus?.status, matchStatus?.sessionId, router]);

  useEffect(() => () => { if (demoTimerRef.current) clearTimeout(demoTimerRef.current); }, []);

  const handleFind = () => {
    if (!AUTH_ENABLED) {
      setStage('searching');
      demoTimerRef.current = setTimeout(() => setStage('matched'), 3500);
      return;
    }

    createMatch.mutate(
      {
        data: {
          topic: track,
          skillLevel,
          chatType: CHAT_TYPE,
          durationMinutes: DEFAULT_DURATION,
          anonymous: true,
        },
      },
      {
        onSuccess: (result) => {
          setMatchId(result.id);
          if (result.status === 'matched' && result.sessionId) {
            setStage('matched');
            router.replace(`/discuss/chat/${result.sessionId}`);
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
        'Live sessions need the API server and Clerk authentication configured. Add your CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY secrets to enable this feature.',
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

      {/* ── CONFIGURE STAGE ── */}
      {stage === 'configure' && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.banner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '28' }]}>
            <View style={[styles.bannerIcon, { backgroundColor: colors.primary + '22' }]}>
              <Feather name="users" size={20} color={colors.primary} />
            </View>
            <View style={styles.bannerText}>
              <Text style={[styles.bannerTitle, { color: colors.foreground }]}>Anonymous Matching</Text>
              <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
                Your real name is never shared. You'll appear as your anonymous handle.
              </Text>
            </View>
          </View>

          {/* Study Track */}
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Study Track</Text>
          <View style={styles.chipGrid}>
            {TRACKS.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTrack(t)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  {
                    backgroundColor: track === t ? colors.primary : 'transparent',
                    borderColor: track === t ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: track === t ? '#fff' : colors.mutedForeground }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Experience */}
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Experience</Text>
          <View style={styles.twoColRow}>
            {EXPERIENCE_LEVELS.map((s) => {
              const selected = skillLevel === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setSkillLevel(s.value)}
                  activeOpacity={0.8}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary + '12' : colors.card,
                    },
                  ]}
                >
                  <Text style={[styles.optionLabel, { color: selected ? colors.primary : colors.foreground }]}>
                    {s.label}
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Language */}
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Language</Text>
          <View style={styles.threeColRow}>
            {LANGUAGES.map((lang) => {
              const selected = language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  activeOpacity={0.8}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary + '12' : colors.card,
                    },
                  ]}
                >
                  <Text style={[styles.optionLabel, { color: selected ? colors.primary : colors.foreground }]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Voice indicator */}
          <View style={[styles.voiceRow, { backgroundColor: colors.primary + '0E', borderColor: colors.primary + '28' }]}>
            <Feather name="mic" size={15} color={colors.primary} />
            <Text style={[styles.voiceLabel, { color: colors.primary }]}>Voice Matching Enabled</Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleFind}
            disabled={createMatch.isPending}
            style={[styles.ctaBtn, { backgroundColor: colors.primary, opacity: createMatch.isPending ? 0.7 : 1 }]}
            activeOpacity={0.85}
          >
            {createMatch.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="search" size={17} color="#fff" />
                <Text style={styles.ctaBtnText}>Start Matching</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── SEARCHING STAGE ── */}
      {stage === 'searching' && (
        <View style={styles.centeredContainer}>
          <View style={styles.pulseContainer}>
            <PulsingRing color={colors.primary} />
            <PulsingRing color={colors.primary} />
            <View style={[styles.pulseCenter, { backgroundColor: colors.primary + '25' }]}>
              <Feather name="users" size={34} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.searchingTitle, { color: colors.foreground }]}>Looking for a partner…</Text>
          <View style={[styles.topicPill, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.topicPillText, { color: colors.primary }]}>{track}</Text>
          </View>
          <Text style={[styles.searchingSub, { color: colors.mutedForeground }]}>
            We'll match you with someone at a similar level
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

      {/* ── MATCHED STAGE ── */}
      {stage === 'matched' && (
        <View style={styles.centeredContainer}>
          <View style={[styles.matchedIcon, { backgroundColor: '#10b98120' }]}>
            <Feather name="check-circle" size={52} color="#10b981" />
          </View>
          <Text style={[styles.matchedTitle, { color: colors.foreground }]}>Partner Found!</Text>
          <Text style={[styles.matchedSub, { color: colors.mutedForeground }]}>
            You've been anonymously matched for a voice session on:
          </Text>
          <View style={[styles.topicPill, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.topicPillText, { color: colors.primary }]}>{track}</Text>
          </View>
          <TouchableOpacity
            onPress={handleStartChat}
            style={[styles.ctaBtn, { backgroundColor: '#10b981', marginTop: 8 }]}
            activeOpacity={0.85}
          >
            <Feather name="phone" size={17} color="#fff" />
            <Text style={styles.ctaBtnText}>Start Call</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancel} style={styles.textBtn} activeOpacity={0.7}>
            <Text style={[styles.textBtnText, { color: colors.mutedForeground }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 0 },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  bannerSub: { fontSize: 12, lineHeight: 17 },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 0,
  },

  // Track chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },

  // Two-column row (experience)
  twoColRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  // Three-column row (language)
  threeColRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },

  // Generic option card used by experience + language
  optionCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 3,
  },
  optionLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  optionDesc: { fontSize: 11, textAlign: 'center' },

  // Voice indicator
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    marginBottom: 0,
  },
  voiceLabel: { fontSize: 13, fontWeight: '600' },

  // CTA button
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 52,
    borderRadius: 14,
    marginTop: 20,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Centered states (searching / matched)
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
  topicPillText: { fontSize: 14, fontWeight: '700' },
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
  textBtn: { marginTop: 4, padding: 8 },
  textBtnText: { fontSize: 14 },
});
