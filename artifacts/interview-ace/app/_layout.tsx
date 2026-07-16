import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, StatusBar, Platform, useColorScheme, View } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PersonalWSProvider } from '@/contexts/PersonalWSContext';
import { IncomingCallModal } from '@/components/friends/IncomingCallModal';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setBaseUrl } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

SplashScreen.preventAutoHideAsync();

const domain = process.env.EXPO_PUBLIC_DOMAIN;
// The API server's preview path is /api. The generated API client and manual
// customFetch calls already include the /api prefix in their paths, so the
// base URL must be the bare domain without any trailing path segment.
if (domain) setBaseUrl(`https://${domain}`);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const proxyUrl = process.env.EXPO_PUBLIC_CLERK_PROXY_URL || undefined;

export const AUTH_ENABLED = publishableKey.length > 0;

const queryClient = new QueryClient();

// Themed stack navigator — must be inside SafeAreaProvider so useColors works.
function ThemedStack() {
  const colors = useColors();
  const isDark = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <IncomingCallModal />
      <Stack
        screenOptions={{
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
          headerTitleStyle: { color: colors.foreground, fontWeight: '700' as const },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="discuss/[id]" options={{ title: '', headerBackTitle: 'Back' }} />
        <Stack.Screen
          name="discuss/new-post"
          options={{
            title: 'New Post',
            presentation: 'modal',
            headerBackTitle: 'Cancel',
            headerStyle: { backgroundColor: colors.card },
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen name="discuss/find-partner" options={{ title: 'Find Study Partner' }} />
        <Stack.Screen name="discuss/chat/[id]" options={{ headerBackTitle: 'Back' }} />
        <Stack.Screen name="learn/[trackId]" options={{ headerBackTitle: 'Learn' }} />
        <Stack.Screen name="learn/lesson/[lessonId]" options={{ headerBackTitle: 'Back' }} />
      </Stack>
    </>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <PersonalWSProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                {children}
              </KeyboardProvider>
            </GestureHandlerRootView>
          </PersonalWSProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // On web, render immediately — Google Fonts CDN may be unreachable in some
  // environments and waiting for fonts keeps the screen blank. Native platforms
  // use the SplashScreen gate as usual so the transition looks polished.
  const ready = Platform.OS === 'web' || fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  if (AUTH_ENABLED) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ClerkProvider } = require('@clerk/expo');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { tokenCache } = require('@clerk/expo/token-cache');

    // ClerkLoaded is intentionally omitted: it blocks render until Clerk
    // initialises. Auth state is guarded per-screen via useAuth() / isLoaded.
    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} proxyUrl={proxyUrl}>
        <AppProviders>
          <ThemedStack />
        </AppProviders>
      </ClerkProvider>
    );
  }

  return (
    <AppProviders>
      <ThemedStack />
    </AppProviders>
  );
}
