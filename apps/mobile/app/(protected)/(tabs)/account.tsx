import Button from '@/shared/components/ui/Button';
import ProBadge from '@/shared/components/common/ProBadge';
import { TIcon, TText, TView } from '@/shared/components/ui/Themed';
import { SUPPORT_FORM_URL } from '@/Config';
import { useSession } from '@/features/auth/context/SessionContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useInternetConnection } from '@/shared/utils/checkInternetConnection';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import ProCard from '@/shared/components/cards/ProCard';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useDev } from '@/shared/hooks/useDev';
import HiveBg from '@/shared/components/common/HiveBg';
import NoInternetCard from '@/shared/components/cards/NoInternetCard';

const SettingsOption = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.optionsChild}>
    <View style={styles.optionsLabel}>
      <TIcon name={icon} size={15} />
      <TText>{label}</TText>
    </View>
    <TIcon name='chevron-right' size={15} style={{opacity: 0.8}}/>
  </TouchableOpacity>
);

export default function AccountScreen() {
  const { session } = useSession();
  const user = session?.user;
  const [devMode, setDevMode] = useState(false);
  const isConnected = useInternetConnection();
  const { t } = useLanguage();
  const { clearCache } = useDev();
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

  return (
    <TView style={{flex: 1}}>
      <HiveBg />
      <ScrollView contentContainerStyle={{padding: 16}} showsVerticalScrollIndicator={true}>
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
                <ProBadge isProUser={true} />
              </View>
              <TText style={{opacity: .5}}>@{user?.username}</TText>
            </View>
            <View style={{ position: 'absolute', right: 0 }}>
              <TIcon name='chevron-right' size={25} />
            </View>
          </TouchableOpacity>
        </TView>
        
        { isConnected ? <ProCard/> : <NoInternetCard/> }

        <View style={styles.options}>
          <TText style={styles.optionsTitle}>{t('tabs.account.personalization_title')}</TText>
          
          { isConnected && 
            <SettingsOption icon='pen' label={t('tabs.account.edit_profile_button')}
              onPress={() => router.push('/settings/edit-profile')}
            />
          }

          <SettingsOption icon='palette' label={t('tabs.account.theme_button')}
            onPress={() => router.push('/settings/theme')}
          />
          <SettingsOption icon='translate' label={t('tabs.account.language_button')}
            onPress={() => router.push('/settings/language')}
          />

          { isConnected && <>
            <TText style={styles.optionsTitle}>{t('tabs.account.privacy_title')}</TText>

            <SettingsOption icon='key' label={t('tabs.account.change_password_button')}
              onPress={() => router.push('/change-password')}
            />
            <SettingsOption icon='eye' label={t('tabs.account.visibility_button')}
              onPress={() => router.push('/settings/visibility')}
            />
            <SettingsOption icon='key' label={t('tabs.account.logs_button')}
              onPress={() => router.push('/settings/request-logs')}
            />
            <SettingsOption icon='file-eye' label={t('tabs.account.privacy_button')}
              onPress={handleWebView(SUPPORT_FORM_URL, t('tabs.account.privacy_button'))}
            />
            <SettingsOption icon='file-alert' label={t('tabs.account.terms_button')}
              onPress={handleWebView(SUPPORT_FORM_URL, t('tabs.account.terms_button'))}
            />

            <TText style={styles.optionsTitle}>{t('tabs.account.help_title')}</TText>

            <SettingsOption icon='pen' label={t('tabs.account.manual_button')}
              onPress={handleWebView(SUPPORT_FORM_URL, t('tabs.account.manual_button'))}
            />
            <SettingsOption icon='headset' label={t('tabs.account.support_button')}
              onPress={handleWebView(SUPPORT_FORM_URL, t('tabs.account.support_button'))}
            />
            <SettingsOption icon='file-find' label={t('tabs.account.about_button')}
              onPress={handleWebView(SUPPORT_FORM_URL, t('tabs.account.about_button'))}
            />

          </>}

            <Pressable 
              onLongPress={() => {
                const timer = setTimeout(() => setDevMode(!devMode), 3000);
                return () => clearTimeout(timer);
              }}
              style={({ pressed }) => [
                styles.optionsChild,
                pressed && { opacity: 0.6 }
              ]}
              delayLongPress={100}
            >
              <View style={styles.optionsLabel}>
                <TIcon name='diversify' size={15} />
                <TText>Tarahive v1.0 {devMode ? ' (Dev Mode)' : ''}</TText>
              </View>
              <TIcon name='chevron-right' size={15} style={{opacity: 0.8}}/>
            </Pressable>

            {devMode && <>
              <TText style={styles.optionsTitle}> {t('tabs.account.developer_title')} </TText>
              <SettingsOption icon='layers-remove' label={t('tabs.account.cache_button')}
                onPress={clearCache}
              />
            </>}
          
        </View>

        <Button
          title={t('tabs.account.logout_button')}
          onPress={() => router.replace('/login')}
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
    fontSize: 15,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionsLabel: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 8,
    opacity: 0.8,
  },
  logoutButton: {
    width: '100%',
    marginVertical: 20,
  },
});