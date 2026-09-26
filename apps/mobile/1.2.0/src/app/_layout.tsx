import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as SplashScreen from 'expo-splash-screen';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SessionProvider } from '@/context/SessionContext';
import { LocationProvider } from '@/context/LocationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LoaderProvider } from '@/context/LoaderContext';

import { useThemeColor } from '@/hooks/shared/useThemeColor';

import { TView } from '@/components/ui/Themed';
import { toastConfig } from '@/components/ui/Toast';
import Toast from 'react-native-toast-message';

import {
  Dialog,
  type DialogState,
  INITIAL_STATE,
} from '@/components/ui/Dialog';
import { Dialog as DialogService } from '@/services/dialog.service';

import { useLoginBg } from '@/hooks/shared/useLoginBg';
import { RouterLoadingOverlay } from '@/hooks/shared/useRouter';

// Leaflet only on web
if (Platform.OS === 'web') {
  require('leaflet/dist/leaflet.css');
}

// Keep the native splash screen visible until initialization is complete.
SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 1000 * 60 * 10,
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require('../../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
  });

  const [dialogState, setDialogState] =
    useState<DialogState>(INITIAL_STATE);

  // Initialize login background image.
  const loginBackground = useLoginBg();

  const appReady =
    loaded &&
    !loginBackground.loading;

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    DialogService._subscribe(setDialogState);
    DialogService._setDismissCallback(handleDismiss);

    return () => {
      DialogService._subscribe(() => {});
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  // Keep rendering nothing while the native splash screen
  // is still visible.
  if (!appReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              <LoaderProvider>
                <AppContent />

                <Toast config={toastConfig} />

                <Dialog
                  state={dialogState}
                  onDismiss={handleDismiss}
                />

                <RouterLoadingOverlay />
              </LoaderProvider>
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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor,
      }}
      edges={['top', 'bottom']}
    >
      <TView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="index"
        />
      </TView>
    </SafeAreaView>
  );
}