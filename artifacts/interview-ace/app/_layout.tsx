import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform, useColorScheme } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              {children}
            </KeyboardProvider>
          </GestureHandlerRootView>
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

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  if (AUTH_ENABLED) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ClerkProvider, ClerkLoaded } = require('@clerk/expo');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { tokenCache } = require('@clerk/expo/token-cache');

    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} proxyUrl={proxyUrl}>
        <ClerkLoaded>
          <AppProviders>
            <ThemedStack />
          </AppProviders>
        </ClerkLoaded>
      </ClerkProvider>
    );
  }

  return (
    <AppProviders>
      <ThemedStack />
    </AppProviders>
  );
}
