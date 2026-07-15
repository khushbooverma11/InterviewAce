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
export default function SignUpScreen() {
  if (!AUTH_ENABLED) return <Redirect href="/(tabs)" />;
  return <SignUpContent />;
}

function SignUpContent() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useSignUp } = require('@clerk/expo');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');

  const isLoading = fetchStatus === 'fetching';

  const handleSignUp = async () => {
    if (isLoading) return;
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return; // errors.fields shows field-level errors
    // On success, send email verification code
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    if (isLoading) return;
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ decorateUrl }: { session: unknown; decorateUrl: (url: string) => string }) => {
          const url = decorateUrl('/');
          if (!url.startsWith('http')) router.replace('/(tabs)');
        },
      });
    }
  };

  // Verification step — email code has been sent
  const needsVerification =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields?.includes('email_address') &&
    signUp.missingFields?.length === 0;

  if (needsVerification) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingHorizontal: 28, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '18' }]}>
            <Feather name="mail" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Verify your email</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We sent a code to {email}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Verification code</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
            placeholder="6-digit code"
            placeholderTextColor={colors.mutedForeground}
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
          {errors?.fields?.code && (
            <FieldError message={errors.fields.code.message} colors={colors} />
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: (!code || isLoading) ? 0.5 : 1, marginTop: 24 }]}
            onPress={handleVerify}
            disabled={!code || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify & continue</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => signUp.verifications.sendEmailCode()} style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Resend code</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => signUp.reset()} style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Back to sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Required for Clerk's bot protection */}
        <View nativeID="clerk-captcha" />
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
          <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Start your interview prep journey</Text>
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
          {errors?.fields?.emailAddress && (
            <FieldError message={errors.fields.emailAddress.message} colors={colors} />
          )}

          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Min. 8 characters"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
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
            onPress={handleSignUp}
            disabled={!email || !password || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create account</Text>}
          </TouchableOpacity>

          <View style={[styles.divider, { borderTopColor: colors.border }]}>
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Required for Clerk's bot protection */}
        <View nativeID="clerk-captcha" />
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
