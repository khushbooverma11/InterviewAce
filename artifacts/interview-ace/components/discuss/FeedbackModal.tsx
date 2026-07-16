import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSubmitSessionFeedback } from '@/hooks/useApi';

interface FeedbackModalProps {
  sessionId: number;
  partnerHandle: string;
  visible: boolean;
  onDismiss: () => void;
}

function StarRow({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  required?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.starRow}>
      <Text style={[styles.starLabel, { color: colors.foreground }]}>
        {label}
        {required && <Text style={{ color: colors.primary }}> *</Text>}
      </Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
            <Feather
              name="star"
              size={28}
              color={n <= value ? '#f59e0b' : colors.border}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function FeedbackModal({ sessionId, partnerHandle, visible, onDismiss }: FeedbackModalProps) {
  const colors = useColors();
  const submit = useSubmitSessionFeedback();

  const [overall, setOverall] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [helpfulness, setHelpfulness] = useState(0);
  const [knowledge, setKnowledge] = useState(0);
  const [comments, setComments] = useState('');

  const canSubmit = overall > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    submit.mutate(
      {
        sessionId,
        feedback: {
          overallRating: overall,
          communication: communication || undefined,
          helpfulness: helpfulness || undefined,
          knowledge: knowledge || undefined,
          comments: comments.trim() || undefined,
        },
      },
      { onSettled: onDismiss },
    );
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>Rate Your Session</Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                How was your session with {partnerHandle}?
              </Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <StarRow label="Overall" value={overall} onChange={setOverall} required />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StarRow label="Communication" value={communication} onChange={setCommunication} />
            <StarRow label="Helpfulness" value={helpfulness} onChange={setHelpfulness} />
            <StarRow label="Technical Knowledge" value={knowledge} onChange={setKnowledge} />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.commentLabel, { color: colors.foreground }]}>Comments (optional)</Text>
            <TextInput
              style={[
                styles.commentInput,
                { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border },
              ]}
              placeholder="Share your thoughts about this session…"
              placeholderTextColor={colors.mutedForeground}
              value={comments}
              onChangeText={setComments}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onDismiss}
              style={[styles.skipBtn, { backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || submit.isPending}
              style={[
                styles.submitBtn,
                { backgroundColor: canSubmit ? colors.primary : colors.secondary },
              ]}
              activeOpacity={0.85}
            >
              {submit.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.submitText, { color: canSubmit ? '#fff' : colors.mutedForeground }]}>
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '800' },
  sub: { fontSize: 13, marginTop: 3 },
  closeBtn: { padding: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  starRow: { marginBottom: 14 },
  starLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 4 },
  star: {},
  commentLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  commentInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  skipBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { fontSize: 15, fontWeight: '600' },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontSize: 15, fontWeight: '700' },
});
