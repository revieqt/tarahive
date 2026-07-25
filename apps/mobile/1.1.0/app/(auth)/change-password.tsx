import Button from '@/shared/components/ui/Button';
import { TText, TView } from '@/shared/components/ui/Themed';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import PasswordField from '@/shared/components/ui/PasswordField';
import Header from '@/shared/components/common/Header';
import HiveBg from '@/shared/components/common/HiveBg';
import PasswordValidationCard from '@/shared/components/cards/PasswordValidationCard';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { useRouter } from 'expo-router';

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { t } = useLanguage();
  const router = useRouter();
  const { changePassword, isPending } = useChangePassword();

  const handleChangePassword = () => {
    changePassword(
      { oldPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          // Reset form on success
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          // Navigate back
          router.back();
        },
      }
    );
  };

  const isFormValid =
    oldPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <TView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ padding: '3%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header
          title={t('auth.change_password.title')}
          subtitle={t('auth.change_password.subtitle')}
        />

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
        <PasswordValidationCard
          password={newPassword}
          confirmPassword={confirmPassword}
          withConfirmation
        />
      </KeyboardAvoidingView>

      <Button
        title={t('auth.change_password.change_button')}
        onPress={handleChangePassword}
        type="primary"
        buttonStyle={styles.updateButton}
        disabled={!isFormValid || isPending}
        loading={isPending}
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