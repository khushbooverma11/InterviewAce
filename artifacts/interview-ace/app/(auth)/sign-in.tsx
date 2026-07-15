import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Redirect, Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { AUTH_ENABLED } from '@/app/_layout';

// @clerk/expo is lazy-required so the native module is never loaded when
// AUTH is disabled (avoids "Cannot find native module ClerkExpo" on web).
export default function SignInScreen() {
  if (!AUTH_ENABLED) return <Redirect href="/(tabs)" />;
  return <SignInContent />;
}

function SignInContent() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useSignIn } = require('@clerk/expo');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const isLoading = fetchStatus === 'fetching';

  const handleSignIn = async () => {
    if (isLoading) return;
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return; // errors.fields shows field-level errors below inputs

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ decorateUrl }: { session: unknown; decorateUrl: (url: string) => string }) => {
          const url = decorateUrl('/');
          if (url.startsWith('http')) {
            // web fallback — won't normally trigger on native
            return;
          }
          router.replace('/(tabs)');
        },
      });
    } else if (signIn.status === 'needs_client_trust') {
      await signIn.mfa.sendEmailCode();
      // UI will switch to MFA view via signIn.status check below
    }
  };

  const handleVerifyMfa = async () => {
    if (isLoading) return;
    await signIn.mfa.verifyEmailCode({ code: mfaCode });
    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ decorateUrl }: { session: unknown; decorateUrl: (url: string) => string }) => {
          const url = decorateUrl('/');
          if (!url.startsWith('http')) router.replace('/(tabs)');
        },
      });
    }
  };

  // MFA screen
  if (signIn.status === 'needs_client_trust') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingHorizontal: 28, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '18' }]}>
            <Feather name="shield" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Check your email</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We sent a verification code to {email}
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Verification code</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
            placeholder="6-digit code"
            placeholderTextColor={colors.mutedForeground}
            value={mfaCode}
            onChangeText={setMfaCode}
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
          {errors?.fields?.code && (
            <FieldError message={errors.fields.code.message} colors={colors} />
          )}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: (!mfaCode || isLoading) ? 0.5 : 1 }]}
            onPress={handleVerifyMfa}
            disabled={!mfaCode || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => signIn.mfa.sendEmailCode()} style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Resend code</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => signIn.reset()} style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Start over</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Feather name="code" size={28} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.primary }]}>InterviewAce</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sign in to continue your prep</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />
          {errors?.fields?.identifier && (
            <FieldError message={errors.fields.identifier.message} colors={colors} />
          )}

          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Your password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />
            <TouchableOpacity
              style={[styles.passwordToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowPassword(v => !v)}
              activeOpacity={0.7}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          {errors?.fields?.password && (
            <FieldError message={errors.fields.password.message} colors={colors} />
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: (!email || !password || isLoading) ? 0.5 : 1, marginTop: 24 }]}
            onPress={handleSignIn}
            disabled={!email || !password || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign in</Text>}
          </TouchableOpacity>

          <View style={[styles.divider, { borderTopColor: colors.border }]}>
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>Don&apos;t have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldError({ message, colors }: { message: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.errorBox, { backgroundColor: colors.destructive + '18', borderColor: colors.destructive + '40' }]}>
      <Feather name="alert-circle" size={13} color={colors.destructive} />
      <Text style={[styles.errorText, { color: colors.destructive }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 28 },
  header: { alignItems: 'center', marginBottom: 40, gap: 8 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  appName: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, textAlign: 'center' },
  form: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
  passwordRow: { flexDirection: 'row', gap: 8 },
  passwordInput: { flex: 1 },
  passwordToggle: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 10, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 17 },
  primaryBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { alignItems: 'center', paddingVertical: 12 },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
  divider: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 24, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12 },
  dividerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '700' },
});
