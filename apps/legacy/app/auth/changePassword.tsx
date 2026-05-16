import Button from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';
import PasswordField from '@/components/PasswordField';
import { useSession, usePasswordUpdate } from '@/context/SessionContext';
import ProcessModal from '@/components/modals/ProcessModal';
import { useThemeColor } from '@/hooks/useThemeColor';
import Wave from '@/components/Wave';
import { router } from 'expo-router';

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
    <ThemedView style={{flex: 1}} color='primary'>
      <KeyboardAvoidingView
        style={{padding: 16}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type='title'>
          Change Password
        </ThemedText>

        {errorMsg ? (
          <ThemedText style={{ color: 'red', marginBottom: 20 }}>{errorMsg}</ThemedText>
        ) : <ThemedText style={{ marginBottom: 20 }}>Enter a minimum of 6 characters</ThemedText>}

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
      </KeyboardAvoidingView>

      <Button
        title={isLoading ? 'Updating...' : 'Update Password'}
        onPress={handleUpdatePassword}
        type="primary"
        buttonStyle={styles.updateButton}
        disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
      />

      <ProcessModal
        visible={showAlert}
        status="success"
        message="Password updated successfully!"
        onClose={() => {
                  setShowAlert(false);
                  router.back();
                }}
      />
      <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  updateButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
});