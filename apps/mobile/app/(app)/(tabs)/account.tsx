import Button from '@/components/ui/Button';
// import ProBadge from '@/components/custom/ProBadge';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { SUPPORT_FORM_URL } from '@/Config';
import { useSession } from '@/features/auth/context/SessionContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInternetConnection } from '@/shared/utils/checkInternetConnection';
import ProfileImage from '@/components/ui/ProfileImage';
import { useQueryClient } from '@tanstack/react-query'
import HiveBg from '@/components/common/HiveBg';
import ProCard from '@/components/cards/ProCard';
import { useLanguage } from '@/shared/context/LanguageContext';

export default function AccountScreen() {
  const { session, clearSession } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [devMode, setDevMode] = useState(false);
  const isConnected = useInternetConnection();
  const { t } = useLanguage();

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

  const fullName = [user?.fname, user?.lname].filter(Boolean).join(' ');

  const handleWebView = (url: string, title: string) => () => {
    router.push({
      pathname: "/webview",
      params: {
        url: url,
        title: title,
      },
    });
  };

  const handleLogout = async () => {
    try {
      await queryClient.clear();
      await clearSession();
      router.replace('/login');
    } catch (err) {
      Alert.alert('Logout Failed', 'An error occurred while logging out.');
    }
  };

  return (
    <TView style={{ flex: 1 }}>
      <HiveBg />
      <ScrollView
        style={{ width: '100%', zIndex: 1000}}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        <TView shadow color='primary' style={styles.header}>
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
                <TText type='subtitle'>{fullName}</TText>
                {/* <ProBadge/> */}
              </View>
              <TText style={{opacity: .5}}>@{user?.username}</TText>
            </View>
            <View style={{ position: 'absolute', right: 0 }}>
              <TIcon name='chevron-right' size={25} />
            </View>
          </TouchableOpacity>
        </TView>
        
        <ProCard/>

        <View style={styles.options}>
          <TText style={styles.optionsTitle}>{t('account.personalization_title')}</TText>
          
          { isConnected && 
            <TouchableOpacity
              onPress={() => router.push('/settings/edit-profile')}
              style={styles.optionsChild}>
              <TIcon name='pen' size={15} />
              <TText>{t('account.edit_profile_button')}</TText>
            </TouchableOpacity>
          }
            
          <TouchableOpacity
            onPress={() => router.push('/settings/theme')}
            style={styles.optionsChild}>
            <TIcon name='palette' size={15} />
            <TText>{t('account.theme_button')}</TText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings/language')}
            style={styles.optionsChild}>
            <TIcon name='translate' size={15} />
            <TText>{t('account.language_button')}</TText>
          </TouchableOpacity>
          
          { isConnected && <>
              <TText style={styles.optionsTitle}>{t('account.privacy_title')}</TText>

              <TouchableOpacity
                onPress={() => router.push('/change-password')}
                style={styles.optionsChild}>
                <TIcon name='key' size={15} />
                <TText>{t('account.change_password_button')}</TText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/settings/visibility')}
                style={styles.optionsChild}>
                <TIcon name='eye' size={15} />
                <TText>{t('account.visibility_button')}</TText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/settings/request-logs')}
                style={styles.optionsChild}>
                <TIcon name='key' size={15} />
                <TText>{t('account.logs_button')}</TText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleWebView('', "Privacy Policy")}
                style={styles.optionsChild}>
                <TIcon name='file-eye' size={15} />
                <TText>{t('account.privacy_button')}</TText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleWebView('', "Terms and Conditions")}
                style={styles.optionsChild}>
                <TIcon name='file-alert' size={15} />
                <TText>{t('account.terms_button')}</TText>
              </TouchableOpacity>
            </>
          }
          

          <TText style={styles.optionsTitle}>
            {t('account.help_title')}
          </TText>

          { isConnected && <>
            <TouchableOpacity onPress={handleWebView(SUPPORT_FORM_URL, "App Manual")}
              style={styles.optionsChild}>
              <TIcon name='file-find' size={15} />
              <TText>{t('account.manual_button')}</TText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleWebView(SUPPORT_FORM_URL, "Contact Support")}
              style={styles.optionsChild}>
              <TIcon name='headset' size={15} />
              <TText>{t('account.support_button')}</TText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleWebView('', "About Tarahive")}
              style={styles.optionsChild}>
              <TIcon name='file-find' size={15} />
              <TText>{t('account.about_button')}</TText>
            </TouchableOpacity>
          </>}

          
          
          
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
            <TIcon name='diversify' size={15} />
            <TText>Tarahive v1.0 {devMode ? ' (Dev Mode)' : ''}</TText>
          </Pressable>

          {devMode && (
            <>
              <TText style={styles.optionsTitle}>
                Developer Tools
              </TText>
              <TouchableOpacity 
                onPress={handleClearCache} 
                style={styles.optionsChild}
              >
                <TIcon 
                  name='layers-remove' 
                  size={15} 
                />
                <TText>Clear Cache</TText>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* Logout Button */}
        <Button
          title={t('account.logout_button')}
          onPress={handleLogout}
          type='primary'
          buttonStyle={styles.logoutButton}
        />

      </ScrollView>
    </TView>
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
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    opacity: 0.8,
  },
  logoutButton: {
    width: '100%',
    marginVertical: 20,
  },
});