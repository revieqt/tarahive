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
    Inter: require('../shared/assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    PoppinsBold: require('../shared/assets/fonts/Poppins-Bold.ttf'),
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
 
  useEffect(() => {
    DialogService._subscribe(setDialogState);
    DialogService._setDismissCallback(handleDismiss);
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