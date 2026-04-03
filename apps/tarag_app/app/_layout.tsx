import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessionProvider, useSession } from '@/context/SessionContext';
import { View } from 'react-native';
import { RouteProvider } from '@/context/RouteContext';
import { AlertsProvider } from '@/context/AlertsContext';
import mobileAds from 'react-native-google-mobile-ads';
import * as SplashScreen from 'expo-splash-screen';
import AnnouncementModal from '@/components/modals/AnnouncementModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnnouncement } from '@/hooks/useAnnouncement';
import { LocationProvider } from '@/context/LocationContext';

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
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => console.log('AdMob initialized'));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>
          <LocationProvider>
            <RouteProvider>
              <AlertsProvider>
                <AppContent />
              </AlertsProvider>
            </RouteProvider>
          </LocationProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const backgroundColor = useThemeColor({}, 'primary');
  const { announcements, currentAnnouncement, handleNextAnnouncement } = useAnnouncement();
  const { session } = useSession();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (currentAnnouncement && session?.user) {
      setIsModalVisible(true);
    }
  }, [currentAnnouncement, session?.user]);

  const handleAnnouncementModalClose = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      handleNextAnnouncement();
    }, 100);
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top', 'bottom']}>
        <Stack 
          screenOptions={{ headerShown: false }}
          initialRouteName={"index"}
        >
          <Stack.Screen name="(tabs)" />
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
        </Stack>
        
      </SafeAreaView>
      
      {announcements.length > 0 && (
        <AnnouncementModal
          visible={isModalVisible}
          announcement={currentAnnouncement}
          onClose={handleAnnouncementModalClose}
        />
      )}
    </View>
  );
}