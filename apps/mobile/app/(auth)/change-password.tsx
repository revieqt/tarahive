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
    <View style={{flex: 1}}>
      <HiveBg />
      <KeyboardAvoidingView
        style={{padding: 16}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        
        <Header title="Change Password" subtitle="Update your account password securely." />

        <PasswordField
          placeholder="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <PasswordField
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <PasswordField
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <PasswordValidationCard password={newPassword} confirmPassword={confirmPassword} withConfirmation/>
      </KeyboardAvoidingView>

      <Button
        title={isLoading ? 'Updating...' : 'Update Password'}
        onPress={handleUpdatePassword}
        type="primary"
        buttonStyle={styles.updateButton}
        disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
      />
    </View>
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