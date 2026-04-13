import Button from '@/components/Button';
// import ProBadge from '@/components/custom/ProBadge';
import { renderSystemTheme } from '@/app/account/settings-systemTheme';
import { ThemedIcons } from '@/components/ThemedIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WebViewModal from '@/components/modals/WebViewModal';
import { SUPPORT_FORM_URL} from '@/constants/Config';
import { useSession } from '@/context/SessionContext';
import { useAlerts } from '@/context/AlertsContext';
import { useLocation } from '@/context/LocationContext';
import { openDocument } from '@/utils/documentUtils';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { renderProUpgrade } from '@/app/account/settings-pro';
import { renderMapTypeSettings } from '@/app/account/settings-mapType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientBlobs from '@/components/GradientBlobs';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import { CustomAlert } from '@/components/Alert';
import ProfileImage from '@/components/ProfileImage';
import { useQueryClient } from '@tanstack/react-query'
import Wave from '@/components/Wave';

export default function AccountScreen() {
  const { session, clearSession } = useSession();
  const { fetchGlobalAlerts, loading: alertsLoading } = useAlerts();
  const user = session?.user;
  const primaryColor = useThemeColor({}, 'primary');
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showWebModal, setShowWebModal] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const isConnected = useInternetConnection();

  const fullName = [user?.fname, user?.lname].filter(Boolean).join(' ');

  const handleLogout = async () => {
    try {
      await queryClient.clear();
      await clearSession();
      router.replace('/auth/login');
    } catch (err) {
      Alert.alert('Logout Failed', 'An error occurred while logging out.');
    }
  };

  const handleManualFetchAlerts = async () => {
    try {
      await fetchGlobalAlerts();
      Alert.alert('Success', 'Global alerts fetched successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch global alerts. Please try again.');
    }
  };


  const handleClearCache = async () => {
    Alert.alert(
      "Clear Cache",
      "By clearing cache, you will lose all your saved data and will log you out. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Success", "All cache has been cleared.");
              await clearSession();
              router.replace('/auth/login');
            } catch (error) {
              console.error("Error clearing AsyncStorage:", error);
              Alert.alert("Error", "Failed to clear cache.");
            }
          },
        },
      ]
    );
  };
  
  return (
    <ThemedView style={{ flex: 1 }}>
      <GradientBlobs/>
      <ScrollView
        style={{ width: '100%', zIndex: 1000}}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        <ThemedView shadow color='primary' style={styles.header}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() =>
              router.push({
                pathname: '/account/[id]',
                params: { id: user?.id },
              })
            }
          >
            <View style={styles.profileImage}>
              <ProfileImage imagePath={user?.profileImage}/>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ThemedText type='subtitle'>{fullName}</ThemedText>
                {/* <ProBadge/> */}
              </View>
              <ThemedText style={{opacity: .5}}>@{user?.username}</ThemedText>
            </View>
            <View style={{ position: 'absolute', right: 0 }}>
              <ThemedIcons name='chevron-right' size={25} />
            </View>
          </TouchableOpacity>
        </ThemedView>
        {/* {renderProUpgrade()} */}
        {/* Options */}
        <View style={styles.options}>
          <ThemedText style={styles.optionsTitle}>
            Customization
          </ThemedText>
          {renderMapTypeSettings()}
          {renderSystemTheme()}
          <ThemedText style={styles.optionsTitle}>
            Privacy and Legal
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/account/settings-accountControl')}
            style={[styles.optionsChild, !isConnected && {opacity: 0.5}]}
            disabled={!isConnected}>
            <ThemedIcons name='key' size={15} />
            <ThemedText>Account Control</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openDocument('privacyPolicy-mobileApp')}
            style={[styles.optionsChild, !isConnected && {opacity: 0.5}]}
            disabled={!isConnected}>
            <ThemedIcons name='file-eye' size={15} />
            <ThemedText>Privacy Policy</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openDocument('terms-mobileApp')}
            style={[styles.optionsChild, !isConnected && {opacity: 0.5}]}
            disabled={!isConnected}>
            <ThemedIcons name='file-alert' size={15} />
            <ThemedText>Terms and Conditions</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.optionsTitle}>
            Help and Support
          </ThemedText>
          <TouchableOpacity onPress={() => openDocument('manual-mobileApp')}
            style={[styles.optionsChild, !isConnected && {opacity: 0.5}]}
            disabled={!isConnected}>
            <ThemedIcons name='file-find' size={15} />
            <ThemedText>App Manual</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowWebModal('support')}
            style={[styles.optionsChild, !isConnected && {opacity: 0.5}]}
            disabled={!isConnected}>
            <ThemedIcons name='headset' size={15} />
            <ThemedText>Contact Support</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openDocument('about')}
            style={[styles.optionsChild, !isConnected && {opacity: 0.5}]}
            disabled={!isConnected}>
            <ThemedIcons name='file-find' size={15} />
            <ThemedText>About TaraG</ThemedText>
          </TouchableOpacity>
          
          
          <Pressable 
            onLongPress={() => {
              const timer = setTimeout(() => {
                setDevMode(!devMode);
                Alert.alert(
                  'Developer Mode', 
                  devMode ? 'Developer mode disabled' : 'Developer mode enabled!'
                );
              }, 3000);
              
              return () => clearTimeout(timer);
            }}
            style={({ pressed }) => [
              styles.optionsChild,
              pressed && { opacity: 0.6 }
            ]}
            delayLongPress={100}
          >
            <ThemedIcons name='diversify' size={15} />
            <ThemedText>TaraG Version 2.0 {devMode ? ' (Dev Mode)' : ''}</ThemedText>
          </Pressable>

          {devMode && (
            <>
              <ThemedText style={styles.optionsTitle}>
                Developer Tools
              </ThemedText>
              <TouchableOpacity 
                onPress={handleManualFetchAlerts}
                style={[styles.optionsChild, (alertsLoading) && {opacity: 0.5}]}
                disabled={alertsLoading}
              >
                <ThemedIcons 
                  name='download' 
                  size={15} 
                />
                <ThemedText>{ alertsLoading ? 'Fetching...' : 'Manually Fetch Global Alerts'}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleClearCache} 
                style={styles.optionsChild}
              >
                <ThemedIcons 
                  name='layers-remove' 
                  size={15} 
                />
                <ThemedText>Clear Cache</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowWebModal('developer')}
                style={[styles.optionsChild, !isConnected && {opacity: 0.5}]}
                disabled={!isConnected}>
                <ThemedIcons name='code-tags' size={15} />
                <ThemedText>About the Developer</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* Logout Button */}
        <Button
          title='Logout'
          onPress={handleLogout}
          type='primary'
          buttonStyle={styles.logoutButton}
        />

      </ScrollView>

      {/* Support Modal */}
      <WebViewModal
        visible={showWebModal != null}
        onClose={() => setShowWebModal(null)}
        uri={showWebModal === 'support' ? SUPPORT_FORM_URL : 'https://joshopsima.vercel.app'}
      />

      <WebViewModal
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        uri={paymentUrl || ""}
      />
      <LinearGradient
        colors={['transparent', primaryColor]}
        style={styles.gradient}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    marginVertical: 16,
    padding: 10,
    borderRadius: 15,
  },
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 50,
    marginRight: 16,
    overflow: 'hidden',
  },
  options: {
    gap: 10,
    width: '100%',
  },
  optionsTitle: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
    paddingBottom: 5,
    fontSize: 14,
  },
  optionsChild: {
    padding: 8,
    fontSize: 15,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    opacity: 0.8,
  },
  logoutButton: {
    width: '100%',
    marginVertical: 20,
  },
  gradient: {
    position: 'absolute',
    height: 50,
    left: 0,
    right: 0,
    bottom: 0,
  },
});