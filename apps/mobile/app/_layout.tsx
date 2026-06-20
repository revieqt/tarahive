import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/features/auth/context/SessionContext';
import { LocationProvider } from '@/shared/context/LocationContext';
import { toastConfig } from "@/shared/components/ui/Toast";
import Toast from "react-native-toast-message";
import { Dialog, type DialogState, INITIAL_STATE } from "@/shared/components/ui/Dialog";
import { Dialog as DialogService } from "@/shared/services/dialog.service";
import { LanguageProvider } from '@/shared/context/LanguageContext';
import { TView } from '@/shared/components/ui/Themed';

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
    Inter: require('../shared/assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    Baloo: require('../shared/assets/fonts/Baloo2-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const [dialogState, setDialogState] = useState<DialogState>(INITIAL_STATE);
 
  // Wire the service to this component's state setter once on mount
  useEffect(() => {
    DialogService._subscribe(setDialogState);
    DialogService._setDismissCallback(handleDismiss);
    // No cleanup needed — the root layout lives for the app's lifetime
  }, []);
 
  const handleDismiss = useCallback(() => {
    setDialogState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              <AppContent />
              <Toast config={toastConfig} />
              <Dialog state={dialogState} onDismiss={handleDismiss} />
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </LocationProvider>
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
      </TView>
    </SafeAreaView>
  );
}