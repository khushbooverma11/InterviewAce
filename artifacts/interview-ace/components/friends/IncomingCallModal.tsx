import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { AvatarBadge } from '@/components/discuss/AvatarBadge';
import { usePersonalWS } from '@/contexts/PersonalWSContext';
import { useDeclineCall } from '@/hooks/useApi';

export function IncomingCallModal() {
  const colors = useColors();
  const router = useRouter();
  const { incomingCall, clearIncomingCall } = usePersonalWS();
  const declineCall = useDeclineCall();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!incomingCall) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [incomingCall, pulseAnim]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    clearIncomingCall();
    router.push(`/discuss/chat/${incomingCall.sessionId}` as never);
  };

  const handleDecline = () => {
    declineCall.mutate({ friendshipId: incomingCall.friendshipId, sessionId: incomingCall.sessionId });
    clearIncomingCall();
  };

  return (
    <Modal transparent animationType="fade" visible={!!incomingCall}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Pulsing avatar */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 16 }}>
            <View style={[styles.avatarRing, { borderColor: '#10b981' }]}>
              <AvatarBadge
                handle={incomingCall.callerHandle}
                avatarColor={incomingCall.callerColor}
                size={64}
              />
            </View>
          </Animated.View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Incoming Voice Call</Text>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {incomingCall.callerHandle}
          </Text>

          <View style={styles.actions}>
            {/* Decline */}
            <TouchableOpacity
              onPress={handleDecline}
              style={[styles.actionBtn, { backgroundColor: '#ef444422' }]}
              activeOpacity={0.8}
            >
              <Feather name="phone-off" size={28} color="#ef4444" />
            </TouchableOpacity>

            {/* Accept */}
            <TouchableOpacity
              onPress={handleAccept}
              style={[styles.actionBtn, { backgroundColor: '#10b98122' }]}
              activeOpacity={0.8}
            >
              <Feather name="phone" size={28} color="#10b981" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Tap ✓ to answer · Tap ✗ to decline
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  actions: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 16,
    marginBottom: 4,
  },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 11, marginTop: 4 },
});
