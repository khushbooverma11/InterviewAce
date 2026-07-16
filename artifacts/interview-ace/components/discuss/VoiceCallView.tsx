/**
 * VoiceCallView — WebRTC peer-to-peer audio call.
 *
 * Web-only component (browser WebRTC APIs required). On native it renders a
 * fallback message.
 *
 * Signaling:
 *  - Caller (userA / isCaller=true) creates the offer.
 *  - Callee (userB) receives the offer and creates the answer.
 *  - Both sides exchange ICE candidates via HTTP polling every 1.5 s.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { customFetch } from '@workspace/api-client-react';

const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
const POLL_INTERVAL_MS = 1500;

interface VoiceSignal {
  id: number;
  type: string;
  payload: string;
}

interface Props {
  sessionId: number;
  isCaller: boolean;
  partnerHandle: string;
  partnerAvatarColor: string;
  onEnd: () => void;
}

// ── helper: initials from an anonymous handle ──────────────────────────────
function initials(handle: string): string {
  const words = handle.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return handle.slice(0, 2).toUpperCase();
}

// ── helper: format seconds as mm:ss ───────────────────────────────────────
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Signal API helpers ─────────────────────────────────────────────────────
async function postSignal(sessionId: number, type: string, payload: string) {
  try {
    await customFetch(`/api/discuss/sessions/${sessionId}/signal`, {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
    });
  } catch { /* non-fatal — we retry via polling */ }
}

async function fetchSignals(sessionId: number): Promise<VoiceSignal[]> {
  try {
    return await customFetch<VoiceSignal[]>(`/api/discuss/sessions/${sessionId}/signals`);
  } catch {
    return [];
  }
}

// ── Native fallback ────────────────────────────────────────────────────────
function NativeFallback({ onEnd, colors }: { onEnd: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.container, { backgroundColor: '#0d0d0d' }]}>
      <Feather name="mic-off" size={48} color={colors.mutedForeground} />
      <Text style={[styles.statusText, { color: colors.foreground, marginTop: 16 }]}>
        Voice calls are only available on web browsers.
      </Text>
      <TouchableOpacity
        style={[styles.endBtn, { marginTop: 32 }]}
        onPress={onEnd}
        activeOpacity={0.8}
      >
        <Feather name="phone-off" size={22} color="#fff" />
        <Text style={styles.endBtnText}>Leave</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function VoiceCallView({ sessionId, isCaller, partnerHandle, partnerAvatarColor, onEnd }: Props) {
  const colors = useColors();

  if (Platform.OS !== 'web') {
    return <NativeFallback onEnd={onEnd} colors={colors} />;
  }

  return (
    <WebVoiceCall
      sessionId={sessionId}
      isCaller={isCaller}
      partnerHandle={partnerHandle}
      partnerAvatarColor={partnerAvatarColor}
      onEnd={onEnd}
      colors={colors}
    />
  );
}

// ── Web WebRTC implementation ──────────────────────────────────────────────
function WebVoiceCall({
  sessionId,
  isCaller,
  partnerHandle,
  partnerAvatarColor,
  onEnd,
  colors,
}: Props & { colors: ReturnType<typeof useColors> }) {
  type CallStatus = 'requesting' | 'connecting' | 'connected' | 'failed' | 'ended';

  const [status, setStatus] = useState<CallStatus>('requesting');
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offerSetRef = useRef(false);   // callee: have we set the remote offer yet?
  const answerSetRef = useRef(false);  // caller: have we set the remote answer yet?
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]); // queue before remote desc

  // Start elapsed timer when connected
  useEffect(() => {
    if (status !== 'connected') return;
    tickTimerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (tickTimerRef.current) clearInterval(tickTimerRef.current); };
  }, [status]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
  }, []);

  const cleanup = useCallback((sendHangup = true) => {
    stopPolling();
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    if (sendHangup) postSignal(sessionId, 'hangup', '{}');
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    localStreamRef.current = null;
    pcRef.current = null;
  }, [sessionId, stopPolling]);

  const handleDisconnect = useCallback(() => {
    setStatus('ended');
    cleanup(true);
    setFeedbackOpen(true);
  }, [cleanup]);

  const handleEnd = useCallback(() => {
    setFeedbackOpen(false);
    onEnd();
  }, [onEnd]);

  const submitFeedback = useCallback(async (skip = false) => {
    if (submittingFeedback) return;

    try {
      setSubmittingFeedback(true);
      if (!skip) {
        await customFetch(`/api/discuss/sessions/${sessionId}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: selectedRating,
            comment: comment.trim() || undefined,
          }),
        });
      }
    } catch {
      // Non-blocking: we still want the user to leave the call gracefully.
    } finally {
      setSubmittingFeedback(false);
      setFeedbackOpen(false);
      onEnd();
    }
  }, [comment, onEnd, selectedRating, sessionId, submittingFeedback]);

  const handleReport = useCallback(() => {
    Alert.alert('Report partner', 'Why do you want to report this person?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Spam', onPress: () => submitReport('spam') },
      { text: 'Harassment', onPress: () => submitReport('harassment') },
      { text: 'Inappropriate', onPress: () => submitReport('inappropriate') },
      { text: 'Other', onPress: () => submitReport('other') },
    ]);
  }, [sessionId]);

  const submitReport = useCallback(async (reason: string) => {
    try {
      await customFetch(`/api/discuss/sessions/${sessionId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details: comment.trim() || undefined }),
      });
      Alert.alert('Thanks', 'Your report has been submitted.');
    } catch {
      Alert.alert('Unable to submit report', 'Please try again in a moment.');
    }
  }, [comment, sessionId]);

  // Process signals polled from the server
  const processSignals = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    const signals = await fetchSignals(sessionId);

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

        // flush any ice candidates queued before remote desc
        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        }
        pendingCandidates.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal(sessionId, 'answer', JSON.stringify(answer));
      }

      if (sig.type === 'answer' && isCaller && !answerSetRef.current) {
        answerSetRef.current = true;
        const desc: RTCSessionDescriptionInit = JSON.parse(sig.payload);
        await pc.setRemoteDescription(new RTCSessionDescription(desc));

        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        }
        pendingCandidates.current = [];
      }

      if (sig.type === 'ice-candidate') {
        const candidate: RTCIceCandidateInit = JSON.parse(sig.payload);
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        } else {
          pendingCandidates.current.push(candidate);
        }
      }
    }
  }, [sessionId, isCaller, cleanup, onEnd]);

  // Bootstrap the WebRTC connection
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Request microphone
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch {
        if (!cancelled) setError('Microphone access denied. Please allow microphone access and refresh.');
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      localStreamRef.current = stream;

      // 2. Create peer connection
      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
      pcRef.current = pc;

      // 3. Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 4. Play remote audio when it arrives
      pc.ontrack = (event) => {
        if (!remoteAudioRef.current) {
          const audio = new Audio();
          audio.autoplay = true;
          remoteAudioRef.current = audio;
        }
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      };

      // 5. Send ICE candidates as they are discovered
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          postSignal(sessionId, 'ice-candidate', JSON.stringify(event.candidate));
        }
      };

      // 6. Track connection state
      pc.onconnectionstatechange = () => {
        if (!cancelled) {
          if (pc.connectionState === 'connected') setStatus('connected');
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            setStatus('failed');
          }
        }
      };

      setStatus('connecting');

      // 7. Caller creates offer
      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await postSignal(sessionId, 'offer', JSON.stringify(offer));
      }

      // 8. Start polling for signals
      if (!cancelled) {
        pollTimerRef.current = setInterval(processSignals, POLL_INTERVAL_MS);
        // Run once immediately for callee to pick up the offer fast
        processSignals();
      }
    }

    init().catch(() => {
      if (!cancelled) setError('Failed to start voice call. Please refresh and try again.');
    });

    return () => {
      cancelled = true;
      cleanup(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update mute state on local tracks
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !muted; });
  }, [muted]);

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: '#0d0d0d' }]}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
        <TouchableOpacity style={styles.endBtn} onPress={handleEnd} activeOpacity={0.8}>
          <Text style={styles.endBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Avatar initials ──────────────────────────────────────────────────────
  const avatarLabel = initials(partnerHandle);
  const statusLabel =
    status === 'requesting' ? 'Requesting microphone…' :
    status === 'connecting' ? 'Connecting…' :
    status === 'connected' ? 'Connected' :
    status === 'failed' ? 'Connection failed' : 'Call ended';

  return (
    <View style={[styles.container, { backgroundColor: '#0d0d0d' }]}>
      {/* Partner avatar */}
      <View style={[styles.avatarRing, { borderColor: status === 'connected' ? '#10b981' : colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: partnerAvatarColor }]}>
          <Text style={styles.avatarText}>{avatarLabel}</Text>
        </View>
      </View>

      <Text style={[styles.handleText, { color: colors.foreground }]}>{partnerHandle}</Text>

      <View style={styles.statusRow}>
        {status === 'connecting' && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />}
        {status === 'connected' && (
          <View style={[styles.liveDot, { backgroundColor: '#10b981' }]} />
        )}
        <Text style={[styles.statusText, { color: status === 'failed' ? '#ef4444' : colors.mutedForeground }]}>
          {statusLabel}
        </Text>
      </View>

      {/* Call timer */}
      {status === 'connected' && (
        <Text style={[styles.timer, { color: colors.foreground }]}>{formatTime(elapsed)}</Text>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Mute toggle */}
        <TouchableOpacity
          style={[
            styles.controlBtn,
            {
              backgroundColor: muted ? '#ef444420' : colors.secondary,
              borderColor: muted ? '#ef4444' : colors.border,
            },
          ]}
          onPress={() => setMuted((m) => !m)}
          activeOpacity={0.8}
        >
          <Feather name={muted ? 'mic-off' : 'mic'} size={22} color={muted ? '#ef4444' : colors.foreground} />
          <Text style={[styles.controlLabel, { color: muted ? '#ef4444' : colors.mutedForeground }]}>
            {muted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleReport} activeOpacity={0.8}>
          <Feather name="flag" size={20} color={colors.foreground} />
          <Text style={[styles.controlLabel, { color: colors.foreground }]}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endBtn} onPress={handleDisconnect} activeOpacity={0.8}>
          <Feather name="phone-off" size={22} color="#fff" />
          <Text style={styles.endBtnText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {feedbackOpen && (
        <View style={styles.feedbackOverlay}>
          <View style={styles.feedbackCard}>
            <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>How was this call?</Text>
            <Text style={[styles.feedbackSub, { color: colors.mutedForeground }]}>Leave a quick rating and note for your partner.</Text>

            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setSelectedRating(value)}
                  activeOpacity={0.8}
                  style={[styles.starBtn, selectedRating >= value && styles.starBtnActive]}
                >
                  <Text style={styles.starText}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary }]}
              placeholder="Optional note"
              placeholderTextColor={colors.mutedForeground}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={160}
            />

            <View style={styles.feedbackActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => submitFeedback(true)} activeOpacity={0.8}>
                <Text style={[styles.skipText, { color: colors.foreground }]}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={() => submitFeedback(false)} activeOpacity={0.8}>
                <Text style={styles.submitText}>{submittingFeedback ? 'Submitting…' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  avatarRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
  },
  handleText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  timer: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 2,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 36,
  },
  controlBtn: {
    width: 90,
    height: 72,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  secondaryBtn: {
    width: 90,
    height: 72,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#111827',
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 26,
    paddingVertical: 18,
    borderRadius: 18,
    minWidth: 120,
  },
  endBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  feedbackOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  feedbackCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  feedbackSub: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  starBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBtnActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  starText: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  feedbackActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  skipText: {
    fontWeight: '600',
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});
