import Button from '@/components/Button';
import TextField from '@/components/TextField';
import PasswordField from '@/components/PasswordField';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';
import { CustomAlert } from '@/components/Alert';
import ProcessModal from '@/components/modals/ProcessModal';
import { useThemeColor } from '@/hooks/useThemeColor';
import Wave from '@/components/Wave';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import { usePasswordResetCodeSending, usePasswordResetCodeVerification } from '@/context/SessionContext';

const RESEND_COOLDOWN = 180; // seconds

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [passwordInputShown, setPasswordInputShown] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [processModalStatus, setProcessModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [processModalMessage, setProcessModalMessage] = useState('');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const accentColor = useThemeColor({}, 'accent');
  const router = useRouter();
  const deviceInfo = useDeviceInfo();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { sendCode, loading: sendingCode } = usePasswordResetCodeSending();
  const { verify, loading: verifyingPassword } = usePasswordResetCodeVerification();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Initialize screen and auto-send code once device info is loaded
  useEffect(() => {
    if (!isInitialized && deviceInfo.isLoaded && email) {
      setIsInitialized(true);
      // Optionally auto-send code when screen loads with email already set
    }
  }, [deviceInfo.isLoaded, email, isInitialized]);

  const handleSendCode = async () => {
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (cooldown > 0) return;
    if (!deviceInfo.isLoaded) {
      setErrorMsg('Device info not yet loaded, please try again');
      return;
    }

    try {
      await sendCode(email);
      setEmailSent(true);
      setCooldown(RESEND_COOLDOWN);
      setShowAlert(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to send verification code.');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setErrorMsg('Please enter the verification code.');
      return;
    }
    
    // Just show password fields - no backend call yet
    setErrorMsg('');
    setPasswordInputShown(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setProcessModalMessage('Resetting password...');
      setProcessModalStatus('processing');
      setShowProcessModal(true);
      
      await verify(email, verificationCode, newPassword);
      
      setProcessModalMessage('Password reset successfully!');
      setProcessModalStatus('success');
      setResetComplete(true);
    } catch (error: any) {
      setProcessModalMessage(error.message || 'Failed to reset password.');
      setProcessModalStatus('error');
      setErrorMsg(error.message || 'Failed to reset password.');
    }
  };

  const renderContent = () => {
    if (!emailSent) {
      return (
        <>
          <ThemedText style={{ marginBottom: 20 }}>
            Enter your email address and we'll send you a verification code.
          </ThemedText>
          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{opacity: (sendingCode || cooldown > 0) ? 0.5 : 1 }}
            onFocus={() => {
              if (sendingCode || cooldown > 0) return false;
            }}
          />
        </>
      );
    }

    if (!passwordInputShown) {
      return (
        <>
          <ThemedText style={{ marginBottom: 20 }}>
            Enter the verification code sent to {email}
          </ThemedText>
          <View style={{ marginBottom: 20 }}>
            <TextField
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
            />
          </View>
        </>
      );
    }

    if (!resetComplete) {
      return (
        <>
          <ThemedText style={{ marginBottom: 20 }}>
            Create your new password
          </ThemedText>
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
        </>
      );
    }

    return (
      <>
        <ThemedText style={{ marginBottom: 20 }}>
          Password reset successfully! You can now log in with your new password.
        </ThemedText>
      </>
    );
  };

  const getButtonConfig = () => {
    if (!emailSent) {
      return {
        title: sendingCode
          ? 'Sending...'
          : cooldown > 0
            ? `Resend Code (${cooldown}s)`
            : 'Send Code',
        onPress: handleSendCode,
        disabled: (sendingCode || cooldown > 0 || !deviceInfo.isLoaded)
      };
    }

    if (!passwordInputShown) {
      return {
        title: 'Next',
        onPress: handleVerifyCode,
        disabled: !verificationCode
      };
    }

    if (!resetComplete) {
      return {
        title: verifyingPassword ? 'Resetting...' : 'Reset Password',
        onPress: handleResetPassword,
        disabled: !newPassword || !confirmPassword || verifyingPassword
      };
    }

    return {
      title: 'Return to Login',
      onPress: () => router.replace('/(auth)/login'),
      disabled: false
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <ThemedView style={{flex: 1}} color='primary'>
      <KeyboardAvoidingView
        style={{padding: 16}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type='title'>
          Forgot Password
        </ThemedText>

        {errorMsg ? (
          <ThemedText style={{ marginBottom: 10, color: 'red' }}>{errorMsg}</ThemedText>
        ) : null}

        {renderContent()}
      </KeyboardAvoidingView>

      <Button
        title={buttonConfig.title}
        onPress={buttonConfig.onPress}
        type="primary"
        buttonStyle={styles.sendButton}
        disabled={buttonConfig.disabled}
      />

      <CustomAlert
        visible={showAlert}
        title="Code Sent!"
        message="Please check your inbox for the verification code."
        icon='check'
        fadeAfter={5000}
        onClose={() => setShowAlert(false)}
        buttons={[
          { text: 'OK', style: 'default', onPress: () => setShowAlert(false) }
        ]}
      />

      <ProcessModal
        visible={showProcessModal}
        status={processModalStatus}
        message={processModalMessage}
        onClose={() => {
          setShowProcessModal(false);
          if (processModalStatus === 'success') {
            router.replace('/auth/login');
          }
        }}
      />
      <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sendButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
});