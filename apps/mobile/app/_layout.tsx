import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/features/auth/context/SessionContext';
import { toastConfig } from "@/components/ui/Toast";
import Toast from "react-native-toast-message";
import { LanguageProvider } from '@/shared/context/LanguageContext';
import { TView } from '@/components/ui/Themed';
import HiveBg from '@/components/common/HiveBg';


SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    Baloo: require('../assets/fonts/Baloo2-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SessionProvider>
            <AppContent />
            <Toast config={toastConfig} />
          </SessionProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const backgroundColor = useThemeColor({}, 'primary');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top', 'bottom']}>
      <TView style={{ flex: 1 }}>
        <Stack 
          screenOptions={{ headerShown: false }}
          initialRouteName={"index"}
        />
          {/* <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="settings/language" />
          <Stack.Screen name="document-view" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgotPassword" />
          <Stack.Screen name="auth/verifyEmail" />
          <Stack.Screen name="auth/changePassword" />
          <Stack.Screen name="account/firstLogin" />
          <Stack.Screen name="account/[id]" />
          <Stack.Screen name="account/settings-accountControl" />
          <Stack.Screen name="routes/routes" />
          <Stack.Screen name="routes/routes-create" />
          <Stack.Screen name="itineraries/itineraries" />
          <Stack.Screen name="itineraries/itineraries-form" />
          <Stack.Screen name="itineraries/[id]" />
          <Stack.Screen name="safety/safety" />
          <Stack.Screen name="rooms/rooms" />
          <Stack.Screen name="rooms/rooms-create" />
          <Stack.Screen name="rooms/rooms-chat" />
          <Stack.Screen name="rooms/rooms-join" />
          <Stack.Screen name="rooms/[id]" />
          <Stack.Screen name="camera/qr-scan" />
          <Stack.Screen name="ai/ai-chat" />
          <Stack.Screen name="ai/ai-itinerary" />
          <Stack.Screen name="+not-found" />
        </Stack> */}
      </TView>
    </SafeAreaView>
  );
}