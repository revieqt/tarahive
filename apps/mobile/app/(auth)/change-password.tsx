import Button from '@/shared/components/ui/Button';
import { TText, TView } from '@/shared/components/ui/Themed';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import PasswordField from '@/shared/components/ui/PasswordField';
import { useSession, usePasswordUpdate } from '@/features/auth/context/SessionContext';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { router } from 'expo-router';
import Header from '@/shared/components/common/Header';
import HiveBg from '@/shared/components/common/HiveBg';
import PasswordValidationCard from '@/shared/components/cards/PasswordValidationCard';
import { useLanguage } from '@/shared/context/LanguageContext';

export default function ChangePasswordScreen() {
  const { session } = useSession();
  const { update, loading, error } = usePasswordUpdate();
  const [errorMsg, setErrorMsg] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const accentColor = useThemeColor({}, 'accent');
  const { t } = useLanguage();

  const handleUpdatePassword = async () => {
    if (!session?.user?.id || !session.accessToken) {
      setErrorMsg('You need to be logged in to change your password');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    try {
      setErrorMsg('');
      setIsLoading(true);
      
      await update(oldPassword, newPassword, confirmPassword);

      setShowAlert(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TView style={{flex: 1}}>
      <HiveBg />
      <KeyboardAvoidingView
        style={{padding: 16}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        
        <Header title={t('auth.change_password.title')} subtitle={t('auth.change_password.subtitle')} />

        <PasswordField
          placeholder={t('auth.change_password.current_password')}
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <PasswordField
          placeholder={t('auth.change_password.new_password')}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <PasswordField
          placeholder={t('auth.change_password.confirm_password')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <PasswordValidationCard password={newPassword} confirmPassword={confirmPassword} withConfirmation/>
      </KeyboardAvoidingView>

      <Button
        title={t('auth.change_password.change_button')}
        onPress={handleUpdatePassword}
        type="primary"
        buttonStyle={styles.updateButton}
        loading={isLoading}
        disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  updateButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});