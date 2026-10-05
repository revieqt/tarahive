import Button from '@/components/ui/Button';
import ProBadge from '@/components/ui/ProBadge';
import { TIcon, TText, TView } from '@/components/ui/Themed';
// import { SUPPORT_FORM_URL } from '@/config';
import { useSession } from '@/context/SessionContext';
import { useLogout } from '@/hooks/auth/useLogout';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import ProfileImage from '@/components/ui/ProfileImage';
import { useLanguage } from '@/context/LanguageContext';
import { useDev } from '@/hooks/shared/useDev';
import NoInternetCard from '@/components/cards/NoInternetCard';
import HiveBg from '@/components/common/HiveBg';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { useThemeColor } from '@/hooks/shared/useThemeColor';

export const SettingsOption = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.optionsChild}>
    <View style={styles.optionsLabel}>
      <TIcon name={icon} size={15} />
      <TText>{label}</TText>
    </View>
    <TIcon name='chevron-right' size={15} style={{ opacity: 0.8 }} />
  </TouchableOpacity>
);

export default function AccountScreen() {
  const { session } = useSession();
  const user = session?.user;
  const { logout } = useLogout();
  const [devMode, setDevMode] = useState(false);
  const isConnected = useInternetConnection();
  const { t } = useLanguage();
  const { clearCache } = useDev();
  const fullName = [user?.fname, user?.lname].filter(Boolean).join(' ');
  const primaryColor = useThemeColor({}, 'primary');

  const handleWebView = (url: string, title: string) => () => {
    router.push({
      pathname: "/webview" as any,
      params: {
        url: url,
        title: title,
      },
    } as any);
  };

  const handleDocs = (id: string, section?: string) => () => {
    router.push({
      pathname: "/docs/[id]" as any,
      params: {
        id: id,
        section: section,
      },
    } as any);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <TView style={{ flex: 1 }}>
      <StickyScrollView
        contentContainerStyle={{ padding: '3%' }}
        title={fullName}
        subtitle={'@'+user?.username}
        showBackButton={false}
      >
        <TouchableOpacity
          style={[styles.header, {backgroundColor: primaryColor}]}
          onPress={() =>
            router.push({
              pathname: '/user/[id]',
              params: { id: user?.username },
            } as any)
          }
        >
          <View style={styles.profileImage}>
            <ProfileImage imagePath={user?.profileImage} />
          </View>
          <View style={{ justifyContent: 'center', gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TText style={{ fontWeight: 700}}>{fullName}</TText>
              <ProBadge isProUser={true} size={14}/>
            </View>
            <TText style={{ opacity: .5, fontSize: 11 }}>@{user?.username}</TText>
          </View>
        </TouchableOpacity>

        {!isConnected && <NoInternetCard />}

        <View style={styles.options}>
          <TText style={styles.optionsTitle}>{t('tabs.account.personalization_title')}</TText>

          {isConnected &&
            <SettingsOption icon='pen' label={t('tabs.account.edit_profile_button')}
              onPress={() => router.push('/settings/edit-profile')}
            />
          }

          <SettingsOption icon='palette' label={t('tabs.account.theme_button')}
            onPress={() => router.push('/settings/theme')}
          />

          {isConnected && <>
            <SettingsOption icon='translate' label={t('tabs.account.language_button')}
              onPress={() => router.push('/settings/language')}
            />

            <TText style={styles.optionsTitle}>{t('tabs.account.privacy_title')}</TText>

            <SettingsOption icon='eye' label={t('tabs.account.visibility_button')}
              onPress={() => router.push('/settings/visibility')}
            />
            <SettingsOption icon='key' label={t('tabs.account.logs_button')}
              onPress={() => router.push('/settings/logs-request')}
            />
            <SettingsOption icon='file-eye' label={t('tabs.account.privacy_button')}
              onPress={handleDocs('policies-terms', 'privacy-policy')}
            />
            <SettingsOption icon='file-alert' label={t('tabs.account.terms_button')}
              onPress={handleDocs('policies-terms', 'terms-and-conditions')}
            />

            <TText style={styles.optionsTitle}>{t('tabs.account.help_title')}</TText>

            <SettingsOption icon='headset' label={t('tabs.account.support_button')}
              onPress={handleWebView('SUPPORT_FORM_URL', t('tabs.account.support_button'))}
            />
            <SettingsOption icon='file-find' label={t('tabs.account.about_button')}
              onPress={handleDocs('about')}
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
              <TText>Tarahive v1.2.0 {devMode ? ' (Dev Mode)' : ''}</TText>
            </View>
            <TIcon name='chevron-right' size={15} style={{ opacity: 0.8 }} />
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
          onPress={handleLogout}
          type='primary'
          buttonStyle={styles.logoutButton}
        />
      </StickyScrollView>
    </TView>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc1',
  },
  profileImage: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 50,
    marginRight: 10,
    overflow: 'hidden',
  },
  options: {
    gap: 8,
    width: '100%',
  },
  optionsTitle: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
    paddingBottom: 5,
    fontWeight: 600,
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
    marginTop: 20,
    marginBottom: 10,
  },
});