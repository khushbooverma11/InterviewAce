import { Redirect, Stack } from 'expo-router';
import { AUTH_ENABLED } from '@/app/_layout';

export default function AuthLayout() {
  // If auth is disabled (no Clerk key), skip sign-in entirely.
  if (!AUTH_ENABLED) return <Redirect href="/(tabs)" />;

  // Lazy-require so @clerk/expo never loads when AUTH_ENABLED is false.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useAuth } = require('@clerk/expo');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
