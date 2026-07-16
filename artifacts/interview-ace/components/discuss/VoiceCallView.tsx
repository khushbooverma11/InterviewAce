/**
 * VoiceCallView — Peer-to-peer WebRTC audio call.
 *
 * Signaling: WebSocket (primary, real-time) with HTTP polling fallback every 3 s.
 *  - isCaller (userA) creates the offer first
 *  - Callee (userB) receives offer → answers
 *  - Both exchange ICE candidates until peer connection is established
 *
 * ICE servers: fetched from /api/ice-servers (includes TURN when configured).
 *
 * Platforms:
 *  - Web: uses browser globals (RTCPeerConnection, navigator.mediaDevices)
 *  - Native: uses react-native-webrtc (requires a custom Expo build, not Expo Go)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Animated, Alert, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { customFetch } from '@workspace/api-client-react';

// ── WebRTC platform loader ────────────────────────────────────────────────────
interface WebRTCModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PeerConnection: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SessionDescription: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  IceCandidate: any;
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  isSupported: boolean;
}

function loadWebRTC(): WebRTCModule {
  if (Platform.OS === 'web') {
    const supported = typeof RTCPeerConnection !== 'undefined';
    return {
      PeerConnection: supported ? RTCPeerConnection : undefined,
      SessionDescription: supported ? RTCSessionDescription : undefined,
      IceCandidate: supported ? RTCIceCandidate : undefined,
      getUserMedia: (c) => navigator.mediaDevices.getUserMedia(c),
      isSupported: supported,
    };
  }
  // Native — requires react-native-webrtc (not available in Expo Go)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require('react-native-webrtc') as {
      RTCPeerConnection: unknown;
      RTCSessionDescription: unknown;
      RTCIceCandidate: unknown;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mediaDevices: any;
    };
    return {
      PeerConnection: rn.RTCPeerConnection,
      SessionDescription: rn.RTCSessionDescription,
      IceCandidate: rn.RTCIceCandidate,
      getUserMedia: (c: MediaStreamConstraints) => rn.mediaDevices.getUserMedia(c),
      isSupported: true,
    };
  } catch {
    return {
      PeerConnection: undefined,
      SessionDescription: undefined,
      IceCandidate: undefined,
      getUserMedia: undefined as unknown as WebRTCModule['getUserMedia'],
      isSupported: false,
    };
  }
}

const WebRTCNative = loadWebRTC();

// ── Config ────────────────────────────────────────────────────────────────────
const FALLBACK_POLL_MS = 3000; // HTTP fallback (WS handles real-time)
const CONNECTION_TIMEOUT_MS = 35_000;
const MAX_SIGNAL_ERRORS = 5;

// ── Types ─────────────────────────────────────────────────────────────────────
interface VoiceSignal { id: number; type: string; payload: string; }
type CallStatus = 'requesting' | 'ringing' | 'connecting' | 'connected' | 'failed' | 'ended';

interface Props {
  sessionId: number;
  isCaller: boolean;
  partnerHandle: string;
  partnerAvatarColor: string;
  onEnd: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── WS URL builder ────────────────────────────────────────────────────────────
function getWsBase(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin
      .replace(/^https/, 'wss')
      .replace(/^http(?!s)/, 'ws');
  }
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? '';
  return domain ? `wss://${domain}` : 'ws://localhost:8080';
}

// ── ICE server fetcher ────────────────────────────────────────────────────────
async function fetchIceServers(): Promise<RTCIceServer[]> {
  try {
    const result = await customFetch<{ iceServers: RTCIceServer[] }>('/api/ice-servers');
    if (Array.isArray(result.iceServers) && result.iceServers.length > 0) return result.iceServers;
  } catch { /* fall through */ }
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];
}

// ── WS signaling socket ───────────────────────────────────────────────────────
async function openSignalingSocket(sessionId: number): Promise<WebSocket | null> {
  try {
    const { ticket } = await customFetch<{ ticket: string }>(
      `/api/discuss/sessions/${sessionId}/ws-ticket`,
    );
    const ws = new WebSocket(`${getWsBase()}/api/ws?sessionId=${sessionId}&ticket=${ticket}`);
    return new Promise((resolve) => {
      const t = setTimeout(() => { ws.close(); resolve(null); }, 5000);
      ws.onopen = () => { clearTimeout(t); resolve(ws); };
      ws.onerror = () => { clearTimeout(t); resolve(null); };
    });
  } catch { return null; }
}

// ── HTTP Signal API (fallback) ────────────────────────────────────────────────
async function postSignalHttp(sessionId: number, type: string, payload: string): Promise<boolean> {
  try {
    await customFetch(`/api/discuss/sessions/${sessionId}/signal`, {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
    });
    return true;
  } catch { return false; }
}

async function fetchSignalsHttp(sessionId: number): Promise<VoiceSignal[] | null> {
  try {
    // cache: 'no-store' prevents the browser from sending If-None-Match conditional
    // requests. Without it, empty-array responses get an ETag cached by the browser,
    // every subsequent poll returns 304, customFetch returns null, and the call tears
    // down after MAX_SIGNAL_ERRORS consecutive "errors".
    return await customFetch<VoiceSignal[]>(
      `/api/discuss/sessions/${sessionId}/signals`,
      { cache: 'no-store' },
    );
  } catch { return null; }
}

// ── Pulsing rings ─────────────────────────────────────────────────────────────
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

function Ellipsis() {
  const [d, setD] = useState('');
  useEffect(() => {
    const t = setInterval(() => setD((p) => (p.length >= 3 ? '' : p + '.')), 500);
    return () => clearInterval(t);
  }, []);
  return <Text style={styles.ellipsis}>{d}</Text>;
}

function CallAvatar({ label, color, status }: { label: string; color: string; status: CallStatus }) {
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

// ── Native fallback (no react-native-webrtc / Expo Go) ───────────────────────
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
      <Text style={[styles.statusLabel, { marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }]}>
        Voice calls need a custom app build.{'\n'}Open in a web browser to call now.
      </Text>
      <TouchableOpacity style={[styles.endPill, { marginTop: 48 }]} onPress={onEnd} activeOpacity={0.8}>
        <Feather name="arrow-left" size={18} color="#fff" />
        <Text style={styles.endPillText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function VoiceCallView(props: Props) {
  if (!WebRTCNative.isSupported) return <NativeFallback {...props} />;
  return <VoiceCallCore {...props} />;
}

// ── Core voice call component ─────────────────────────────────────────────────
function VoiceCallCore({ sessionId, isCaller, partnerHandle, partnerAvatarColor, onEnd }: Props) {
  const [status, setStatus] = useState<CallStatus>('requesting');
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pcRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null); // web only
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offerSetRef = useRef(false);
  const answerSetRef = useRef(false);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const signalErrorsRef = useRef(0);

  // Call timer
  useEffect(() => {
    if (status !== 'connected') return;
    tickRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [status]);

  const stopAll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  // Send a signal — WebSocket primary, HTTP fallback
  const sendSignal = useCallback((type: string, payload: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'signal', signalType: type, payload }));
    } else {
      postSignalHttp(sessionId, type, payload);
    }
  }, [sessionId]);

  const cleanup = useCallback((sendHangup = true) => {
    stopAll();
    if (sendHangup) sendSignal('hangup', '{}');
    const ws = wsRef.current;
    if (ws) { ws.onmessage = null; ws.onerror = null; ws.onclose = null; ws.close(); wsRef.current = null; }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    localStreamRef.current = null;
    pcRef.current = null;
    if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = null; remoteAudioRef.current = null; }
  }, [sendSignal, stopAll]);

  const handleDisconnect = useCallback(() => {
    setStatus('ended');
    cleanup(true);
    setFeedbackOpen(true);
  }, [cleanup]);

  // Process a single incoming signal
  const processOneSignal = useCallback(async (sig: VoiceSignal) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (sig.type === 'hangup') {
      setStatus('ended');
      cleanup(false);
      onEnd();
      return;
    }
    if (sig.type === 'offer' && !isCaller && !offerSetRef.current) {
      offerSetRef.current = true;
      const desc: RTCSessionDescriptionInit = JSON.parse(sig.payload);
      await pc.setRemoteDescription(new WebRTCNative.SessionDescription(desc));
      for (const c of pendingCandidates.current)
        await pc.addIceCandidate(new WebRTCNative.IceCandidate(c)).catch(() => {});
      pendingCandidates.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal('answer', JSON.stringify(answer));
    }
    if (sig.type === 'answer' && isCaller && !answerSetRef.current) {
      answerSetRef.current = true;
      const desc: RTCSessionDescriptionInit = JSON.parse(sig.payload);
      await pc.setRemoteDescription(new WebRTCNative.SessionDescription(desc));
      for (const c of pendingCandidates.current)
        await pc.addIceCandidate(new WebRTCNative.IceCandidate(c)).catch(() => {});
      pendingCandidates.current = [];
    }
    if (sig.type === 'ice-candidate') {
      const cand: RTCIceCandidateInit = JSON.parse(sig.payload);
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new WebRTCNative.IceCandidate(cand)).catch(() => {});
      } else {
        pendingCandidates.current.push(cand);
      }
    }
  }, [isCaller, cleanup, onEnd, sendSignal]);

  // HTTP polling fallback (also catches any signals missed by WS)
  const pollSignals = useCallback(async () => {
    const signals = await fetchSignalsHttp(sessionId);
    if (signals === null) {
      signalErrorsRef.current += 1;
      if (signalErrorsRef.current >= MAX_SIGNAL_ERRORS) {
        setError('Cannot reach the server. Please check your connection.');
        cleanup(false);
      }
      return;
    }
    signalErrorsRef.current = 0;
    for (const sig of signals) await processOneSignal(sig);
  }, [sessionId, cleanup, processOneSignal]);

  // Bootstrap
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Fetch ICE servers (STUN + TURN)
      const iceServers = await fetchIceServers();

      // 2. Get microphone
      let stream: MediaStream;
      try {
        stream = await WebRTCNative.getUserMedia({ audio: true, video: false });
      } catch {
        if (!cancelled) setError('Microphone access denied. Please allow mic access and try again.');
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      localStreamRef.current = stream;

      // 3. RTCPeerConnection
      const pc = new WebRTCNative.PeerConnection({ iceServers });
      pcRef.current = pc;
      stream.getTracks().forEach((track: MediaStreamTrack) => pc.addTrack(track, stream));

      // 4. Remote audio
      //    Web: play via HTMLAudioElement. Native: react-native-webrtc routes audio automatically.
      pc.ontrack = (ev: RTCTrackEvent) => {
        if (Platform.OS === 'web') {
          if (!remoteAudioRef.current) {
            const audio = new Audio();
            audio.autoplay = true;
            remoteAudioRef.current = audio;
          }
          remoteAudioRef.current.srcObject = ev.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // 5. ICE candidates → signal
      pc.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
        if (ev.candidate) sendSignal('ice-candidate', JSON.stringify(ev.candidate));
      };

      // 6. Connection state
      pc.onconnectionstatechange = () => {
        if (cancelled) return;
        if (pc.connectionState === 'connected') {
          setStatus('connected');
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
        if (pc.connectionState === 'disconnected') {
          // Transient — ICE may recover; just surface a status update without tearing down.
          setStatus('connecting');
        }
        if (pc.connectionState === 'failed') {
          setStatus('failed');
          setError('The call was disconnected unexpectedly.');
          cleanup(false);
        }
      };

      if (!cancelled) setStatus(isCaller ? 'ringing' : 'connecting');

      // 7. Connect WebSocket signaling (before sending the offer so callee gets it in real-time)
      const ws = await openSignalingSocket(sessionId);
      if (ws && !cancelled) {
        wsRef.current = ws;
        ws.onmessage = (event: MessageEvent) => {
          try {
            const msg = JSON.parse(event.data as string) as {
              type: string; signalType: string; payload: string;
            };
            if (msg.type === 'signal') {
              processOneSignal({ id: 0, type: msg.signalType, payload: msg.payload });
            }
          } catch { /* ignore malformed */ }
        };
        ws.onerror = () => { wsRef.current = null; };
        ws.onclose = () => { wsRef.current = null; };
      }

      // 8. Caller sends offer
      if (isCaller && !cancelled) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal('offer', JSON.stringify(offer));
      }

      // 9. HTTP fallback polling + connection timeout
      if (!cancelled) {
        // One immediate poll to pick up signals sent before WS connected
        pollSignals();
        pollRef.current = setInterval(pollSignals, FALLBACK_POLL_MS);

        timeoutRef.current = setTimeout(() => {
          if (!cancelled && pc.connectionState !== 'connected') {
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

  // Mute toggle
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

  // ── Feedback screen ──────────────────────────────────────────────────────────
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

  // ── Error screen ─────────────────────────────────────────────────────────────
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

  // ── Call screen ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
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
          {status === 'ringing' && (<><Text style={styles.statusLabel}>Calling</Text><Ellipsis /></>)}
          {status === 'connecting' && (<><Text style={styles.statusLabel}>Connecting</Text><Ellipsis /></>)}
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

      <CallAvatar label={initials(partnerHandle)} color={partnerAvatarColor} status={status} />

      <View style={styles.controls}>
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

        <TouchableOpacity style={styles.endPill} onPress={handleDisconnect} activeOpacity={0.8}>
          <Feather name="phone-off" size={22} color="#fff" />
          <Text style={styles.endPillText}>End Call</Text>
        </TouchableOpacity>

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
