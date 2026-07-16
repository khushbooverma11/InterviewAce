/**
 * VoiceCallView — Peer Up-style WebRTC audio call.
 *
 * Web-only. On native shows a "use web browser" fallback.
 *
 * Signaling: HTTP polling every 1.5 s against /api/discuss/sessions/:id/signals
 *  - isCaller (userA) creates the offer first
 *  - Callee (userB) receives offer → answers
 *  - Both exchange ICE candidates until peer connection is established
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Animated, Alert, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { customFetch } from '@workspace/api-client-react';

// ── Config ───────────────────────────────────────────────────────────────────
const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
const POLL_INTERVAL_MS = 1500;
const CONNECTION_TIMEOUT_MS = 35_000;
const MAX_SIGNAL_ERRORS = 5; // consecutive API failures before showing error

// ── Types ────────────────────────────────────────────────────────────────────
interface VoiceSignal { id: number; type: string; payload: string; }
type CallStatus = 'requesting' | 'ringing' | 'connecting' | 'connected' | 'failed' | 'ended';

interface Props {
  sessionId: number;
  isCaller: boolean;
  partnerHandle: string;
  partnerAvatarColor: string;
  onEnd: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function initials(handle: string): string {
  const words = handle.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return handle.slice(0, 2).toUpperCase();
}
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Signal API ────────────────────────────────────────────────────────────────
async function postSignal(sessionId: number, type: string, payload: string): Promise<boolean> {
  try {
    await customFetch(`/api/discuss/sessions/${sessionId}/signal`, {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
    });
    return true;
  } catch { return false; }
}

/** Returns null on error (vs. empty array = no signals yet) */
async function fetchSignals(sessionId: number): Promise<VoiceSignal[] | null> {
  try {
    return await customFetch<VoiceSignal[]>(`/api/discuss/sessions/${sessionId}/signals`);
  } catch { return null; }
}

// ── Pulsing rings (connecting animation) ─────────────────────────────────────
function PulsingRings({ color, active }: { color: string; active: boolean }) {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) { [a1, a2, a3].forEach((a) => a.setValue(0)); return; }

    const makeLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: false }),
        ]),
      );

    const l1 = makeLoop(a1, 0);
    const l2 = makeLoop(a2, 600);
    const l3 = makeLoop(a3, 1200);
    l1.start(); l2.start(); l3.start();
    return () => { l1.stop(); l2.stop(); l3.stop(); };
  }, [active, a1, a2, a3]);

  const ring = (anim: Animated.Value) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.45, 0.2, 0] }),
  });

  return (
    <>
      <Animated.View style={[styles.ring, { borderColor: color }, ring(a1)]} />
      <Animated.View style={[styles.ring, { borderColor: color }, ring(a2)]} />
      <Animated.View style={[styles.ring, { borderColor: color }, ring(a3)]} />
    </>
  );
}

// ── Animated ellipsis ─────────────────────────────────────────────────────────
function Ellipsis() {
  const [d, setD] = useState('');
  useEffect(() => {
    const t = setInterval(() => setD((p) => (p.length >= 3 ? '' : p + '.')), 500);
    return () => clearInterval(t);
  }, []);
  return <Text style={styles.ellipsis}>{d}</Text>;
}

// ── Avatar block ──────────────────────────────────────────────────────────────
function CallAvatar({
  label, color, status,
}: { label: string; color: string; status: CallStatus }) {
  const isPulsing = status === 'requesting' || status === 'ringing' || status === 'connecting';
  const borderColor = status === 'connected' ? '#10b981' : '#1e293b';
  return (
    <View style={styles.avatarArea}>
      <PulsingRings color={color} active={isPulsing} />
      <View style={[styles.avatarRing, { borderColor }]}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarInitials}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Native fallback ───────────────────────────────────────────────────────────
function NativeFallback({ partnerHandle, partnerAvatarColor, onEnd }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarArea}>
        <View style={[styles.avatarRing, { borderColor: '#1e293b' }]}>
          <View style={[styles.avatar, { backgroundColor: partnerAvatarColor }]}>
            <Text style={styles.avatarInitials}>{initials(partnerHandle)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.handleText}>{partnerHandle}</Text>
      <Text style={[styles.statusLabel, { marginTop: 8 }]}>Voice calls require a web browser.</Text>
      <TouchableOpacity style={[styles.endPill, { marginTop: 48 }]} onPress={onEnd} activeOpacity={0.8}>
        <Feather name="arrow-left" size={18} color="#fff" />
        <Text style={styles.endPillText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function VoiceCallView(props: Props) {
  if (Platform.OS !== 'web') return <NativeFallback {...props} />;
  return <WebVoiceCall {...props} />;
}

// ── WebRTC component ──────────────────────────────────────────────────────────
function WebVoiceCall({ sessionId, isCaller, partnerHandle, partnerAvatarColor, onEnd }: Props) {
  const [status, setStatus] = useState<CallStatus>('requesting');
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offerSetRef = useRef(false);
  const answerSetRef = useRef(false);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const signalErrorsRef = useRef(0);

  // Tick timer
  useEffect(() => {
    if (status !== 'connected') return;
    tickRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [status]);

  const stopAll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const cleanup = useCallback((sendHangup = true) => {
    stopAll();
    if (sendHangup) postSignal(sessionId, 'hangup', '{}');
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    localStreamRef.current = null;
    pcRef.current = null;
  }, [sessionId, stopAll]);

  const handleDisconnect = useCallback(() => {
    setStatus('ended');
    cleanup(true);
    setFeedbackOpen(true);
  }, [cleanup]);

  const processSignals = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    const signals = await fetchSignals(sessionId);

    if (signals === null) {
      signalErrorsRef.current += 1;
      if (signalErrorsRef.current >= MAX_SIGNAL_ERRORS) {
        setError('Cannot reach the server. Please check your connection or try again later.');
        cleanup(false);
      }
      return;
    }
    signalErrorsRef.current = 0;

    for (const sig of signals) {
      if (sig.type === 'hangup') {
        setStatus('ended');
        cleanup(false);
        onEnd();
        return;
      }
      if (sig.type === 'offer' && !isCaller && !offerSetRef.current) {
        offerSetRef.current = true;
        const desc: RTCSessionDescriptionInit = JSON.parse(sig.payload);
        await pc.setRemoteDescription(new RTCSessionDescription(desc));
        for (const c of pendingCandidates.current)
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        pendingCandidates.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal(sessionId, 'answer', JSON.stringify(answer));
      }
      if (sig.type === 'answer' && isCaller && !answerSetRef.current) {
        answerSetRef.current = true;
        const desc: RTCSessionDescriptionInit = JSON.parse(sig.payload);
        await pc.setRemoteDescription(new RTCSessionDescription(desc));
        for (const c of pendingCandidates.current)
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        pendingCandidates.current = [];
      }
      if (sig.type === 'ice-candidate') {
        const cand: RTCIceCandidateInit = JSON.parse(sig.payload);
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
        } else {
          pendingCandidates.current.push(cand);
        }
      }
    }
  }, [sessionId, isCaller, cleanup, onEnd]);

  // Bootstrap WebRTC
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Microphone
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch {
        if (!cancelled) setError('Microphone access denied. Please allow microphone access and try again.');
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      localStreamRef.current = stream;

      // 2. Peer connection
      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 3. Remote audio
      pc.ontrack = (ev) => {
        if (!remoteAudioRef.current) {
          const audio = new Audio();
          audio.autoplay = true;
          remoteAudioRef.current = audio;
        }
        remoteAudioRef.current.srcObject = ev.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      };

      // 4. ICE
      pc.onicecandidate = (ev) => {
        if (ev.candidate) postSignal(sessionId, 'ice-candidate', JSON.stringify(ev.candidate));
      };

      // 5. State changes
      pc.onconnectionstatechange = () => {
        if (cancelled) return;
        if (pc.connectionState === 'connected') {
          setStatus('connected');
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setStatus('failed');
          setError('The call was disconnected unexpectedly.');
          cleanup(false);
        }
      };

      if (!cancelled) setStatus(isCaller ? 'ringing' : 'connecting');

      // 6. Caller sends offer
      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await postSignal(sessionId, 'offer', JSON.stringify(offer));
      }

      // 7. Poll + connection timeout
      if (!cancelled) {
        pollRef.current = setInterval(processSignals, POLL_INTERVAL_MS);
        processSignals();
        timeoutRef.current = setTimeout(() => {
          if (!cancelled && pcRef.current?.connectionState !== 'connected') {
            setError("Couldn't reach your partner. They may have left or the connection timed out.");
            cleanup(true);
          }
        }, CONNECTION_TIMEOUT_MS);
      }
    }

    init().catch(() => {
      if (!cancelled) setError('Failed to start the call. Please refresh and try again.');
    });

    return () => {
      cancelled = true;
      cleanup(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mute
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !muted; });
  }, [muted]);

  const submitFeedback = useCallback(async (skip = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (!skip) {
        await customFetch(`/api/discuss/sessions/${sessionId}/rate`, {
          method: 'POST',
          body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
        });
      }
    } catch { /* non-blocking */ } finally {
      setSubmitting(false);
      setFeedbackOpen(false);
      onEnd();
    }
  }, [comment, onEnd, rating, sessionId, submitting]);

  // ── Feedback screen ──────────────────────────────────────────────────────
  if (feedbackOpen) {
    return (
      <View style={styles.container}>
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>How was the call?</Text>
          <Text style={styles.feedbackSub}>Rate your session with {partnerHandle}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((v) => (
              <TouchableOpacity key={v} style={[styles.starBtn, rating >= v && styles.starBtnOn]}
                onPress={() => setRating(v)} activeOpacity={0.7}>
                <Feather name="star" size={24} color={rating >= v ? '#f59e0b' : '#334155'} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a note (optional)"
            placeholderTextColor="#475569"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />
          <View style={styles.feedbackActions}>
            <TouchableOpacity style={styles.skipBtn} onPress={() => submitFeedback(true)} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={() => submitFeedback(false)} activeOpacity={0.8}>
              <Text style={styles.submitText}>{submitting ? 'Saving…' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── Error screen ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.container}>
        <CallAvatar label={initials(partnerHandle)} color={partnerAvatarColor} status="failed" />
        <Text style={styles.handleText}>{partnerHandle}</Text>
        <View style={styles.errorBox}>
          <Feather name="wifi-off" size={20} color="#f87171" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <TouchableOpacity style={styles.endPill} onPress={onEnd} activeOpacity={0.8}>
          <Feather name="arrow-left" size={18} color="#fff" />
          <Text style={styles.endPillText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Call screen ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Top: name + status */}
      <View style={styles.topSection}>
        {status === 'connected' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <Text style={styles.handleText}>{partnerHandle}</Text>
        <View style={styles.statusRow}>
          {status === 'requesting' && <Text style={styles.statusLabel}>Requesting mic…</Text>}
          {status === 'ringing' && (
            <><Text style={styles.statusLabel}>Calling</Text><Ellipsis /></>
          )}
          {status === 'connecting' && (
            <><Text style={styles.statusLabel}>Connecting</Text><Ellipsis /></>
          )}
          {status === 'connected' && (
            <Text style={[styles.statusLabel, { color: '#10b981', fontWeight: '700' }]}>
              {formatTime(elapsed)}
            </Text>
          )}
          {status === 'failed' && (
            <Text style={[styles.statusLabel, { color: '#f87171' }]}>Connection failed</Text>
          )}
        </View>
      </View>

      {/* Avatar + pulsing rings */}
      <CallAvatar label={initials(partnerHandle)} color={partnerAvatarColor} status={status} />

      {/* Controls */}
      <View style={styles.controls}>
        {/* Mute */}
        <TouchableOpacity
          style={[styles.circleBtn, muted && styles.circleBtnDanger]}
          onPress={() => setMuted((m) => !m)}
          activeOpacity={0.8}
        >
          <Feather name={muted ? 'mic-off' : 'mic'} size={22} color={muted ? '#f87171' : '#e2e8f0'} />
          <Text style={[styles.circleBtnLabel, muted && { color: '#f87171' }]}>
            {muted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>

        {/* End call — prominent center */}
        <TouchableOpacity style={styles.endPill} onPress={handleDisconnect} activeOpacity={0.8}>
          <Feather name="phone-off" size={22} color="#fff" />
          <Text style={styles.endPillText}>End Call</Text>
        </TouchableOpacity>

        {/* Report */}
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => {
            Alert.alert('Report', 'Why are you reporting this user?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Spam', onPress: () => doReport(sessionId, 'spam') },
              { text: 'Harassment', onPress: () => doReport(sessionId, 'harassment') },
              { text: 'Inappropriate', onPress: () => doReport(sessionId, 'inappropriate') },
              { text: 'Other', onPress: () => doReport(sessionId, 'other') },
            ]);
          }}
          activeOpacity={0.8}
        >
          <Feather name="flag" size={20} color="#94a3b8" />
          <Text style={styles.circleBtnLabel}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

async function doReport(sessionId: number, reason: string) {
  try {
    await customFetch(`/api/discuss/sessions/${sessionId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    Alert.alert('Reported', 'Thank you for your report.');
  } catch {
    Alert.alert('Error', 'Could not submit report. Please try again.');
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────
const AVATAR_SIZE = 120;
const RING_SIZE = AVATAR_SIZE + 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080c14',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingBottom: 52,
    paddingHorizontal: 24,
  },

  // Top
  topSection: { alignItems: 'center', gap: 6 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10b98118',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  liveText: { color: '#10b981', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  handleText: { color: '#f1f5f9', fontSize: 26, fontWeight: '700', textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', height: 22 },
  statusLabel: { color: '#64748b', fontSize: 15, fontWeight: '500' },
  ellipsis: { color: '#64748b', fontSize: 15, width: 20 },

  // Avatar
  avatarArea: {
    width: RING_SIZE * 2.8,
    height: RING_SIZE * 2.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
  },
  avatarRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080c14',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 36, fontWeight: '800' },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    width: '100%',
  },
  circleBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  circleBtnDanger: { backgroundColor: '#1c0a0a', borderColor: '#7f1d1d' },
  circleBtnLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '600', marginTop: 1 },
  endPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 50,
    shadowColor: '#ef4444',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  endPillText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Error
  errorBox: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#450a0a40',
    borderRadius: 14,
    padding: 18,
    marginVertical: 24,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#7f1d1d60',
  },
  errorText: { color: '#fca5a5', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Feedback
  feedbackCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  feedbackTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  feedbackSub: { color: '#64748b', fontSize: 14, marginBottom: 22 },
  ratingRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  starBtn: { padding: 6, borderRadius: 8 },
  starBtnOn: { backgroundColor: '#f59e0b15' },
  commentInput: {
    backgroundColor: '#080c14',
    borderRadius: 12,
    padding: 14,
    color: '#f1f5f9',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  feedbackActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  skipBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  skipText: { color: '#64748b', fontWeight: '600', fontSize: 15 },
  submitBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, backgroundColor: '#6366f1' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
