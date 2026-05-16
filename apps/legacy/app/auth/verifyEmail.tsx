import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';
import { useSession, useEmailVerification, use2FACodeSending, useEmailCodeVerification, useEmail2FAVerification } from '@/context/SessionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import Wave from '@/components/Wave';

const RESEND_COOLDOWN = 180;

export default function VerifyEmailScreen() {
  const { email, is2FA, accessToken, refreshToken, userData } = useLocalSearchParams<{ 
    email: string; 
    is2FA: string;
    accessToken: string;
    refreshToken: string;
    userData: string;
  }>();
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const accentColor = useThemeColor({}, 'accent');
  const { updateSession } = useSession();
  const is2FAMode = is2FA === 'true';
  const deviceInfo = useDeviceInfo();

  // Use appropriate hook based on mode
  const emailVerificationHook = useEmailVerification();
  const twoFACodeHook = use2FACodeSending();
  const { sendCode, loading: sendingCode, error: sendError } = is2FAMode ? twoFACodeHook : emailVerificationHook;
  
  const { verify: verifyEmailCode, loading: verifyingEmailCode, error: verifyEmailError } = useEmailCodeVerification();
  const { verify: verify2FACode, loading: verifying2FACode, error: verify2FAError } = useEmail2FAVerification();

  const sendVerificationCode = async () => {
    try {
      setErrorMsg('');
      // Device info should be loaded before calling sendCode
      if (!deviceInfo.isLoaded) {
        setErrorMsg('Device info not yet loaded, please try again');
        return;
      }
      await sendCode(email);
      setCooldown(RESEND_COOLDOWN);
    } catch (error: any) {
      setErrorMsg(sendError || error.message);
    }
  };

  // Wait for device info to load before sending verification code
  useEffect(() => {
    if (!isInitialized && deviceInfo.isLoaded && email) {
      setIsInitialized(true);
      sendVerificationCode();
    }
  }, [deviceInfo.isLoaded, email, isInitialized]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerification = async () => {
    if (!code) return;
    
    try {
      setErrorMsg('');
      
      // Use the appropriate verify function based on mode
      if (is2FAMode) {
        await verify2FACode(email, code);
        
        // Handle 2FA verification - just let them in
        // Parse and save user data from login result
        if (userData && accessToken && refreshToken) {
          const parsedUser = JSON.parse(userData);
          const sessionData = {
            id: parsedUser._id,
            fname: parsedUser.fname,
            lname: parsedUser.lname,
            username: parsedUser.username,
            email: parsedUser.email,
            bdate: new Date(parsedUser.bdate),
            gender: parsedUser.gender,
            contactNumber: parsedUser.contactNumber,
            profileImage: parsedUser.profileImage,
            likes: parsedUser.likes || [],
            isProUser: parsedUser.isProUser,
            bio: parsedUser.bio || '',
            status: parsedUser.status,
            type: parsedUser.type,
            expPoints: parsedUser.expPoints,
            createdOn: new Date(parsedUser.createdOn),
            isFirstLogin: parsedUser.isFirstLogin,
            safetyState: parsedUser.safetyState,
            visibilitySettings: parsedUser.visibilitySettings,
            securitySettings: parsedUser.securitySettings,
            taraBuddySettings: parsedUser.taraBuddySettings,
          };
          
          await updateSession({
            user: sessionData,
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
          
          if (parsedUser.isFirstLogin) {
            router.replace('/account/firstLogin' as any);
          } else {
            router.replace('/(tabs)/home' as any);
          }
        } else {
          router.replace('/(tabs)/home' as any);
        }
      } else {
        // Handle account email verification
        await verifyEmailCode(email, code);
        router.replace('/account/firstLogin' as any);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Verification failed';
      setErrorMsg(errorMessage);
    }
  };

  return (
    <ThemedView style={{flex: 1}} color='primary'>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type='title'>
          {is2FAMode ? 'Two-Factor Authentication' : 'Verify Email'}
        </ThemedText>
        <ThemedText style={{ marginBottom: 20 }}>
          {is2FAMode 
            ? `We've sent a verification code to ${email}` 
            : `We've sent a code to ${email}`}
        </ThemedText>

        <TextField
          placeholder="Enter verification code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
        />

        {errorMsg ? (
          <ThemedText style={{ color: 'red', marginTop: 10 }}>{errorMsg}</ThemedText>
        ) : null}

        <View style={styles.resendContainer}>
          <TouchableOpacity
            onPress={sendVerificationCode}
            disabled={cooldown > 0 || sendingCode || !deviceInfo.isLoaded}
          >
            <ThemedText style={[
              styles.resendText,
              (cooldown > 0 || sendingCode || !deviceInfo.isLoaded) && styles.resendTextDisabled
            ]}>
              {!deviceInfo.isLoaded ? 'Loading...' : sendingCode ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Button
        title={is2FAMode 
          ? (verifying2FACode ? 'Verifying...' : 'Verify Identity')
          : (verifyingEmailCode ? 'Verifying...' : 'Verify Email')}
        onPress={handleVerification}
        type="primary"
        buttonStyle={styles.sendButton}
        disabled={(is2FAMode ? verifying2FACode : verifyingEmailCode) || !code || code.length !== 6}
      />

      <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  sendButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  resendText: {
    opacity: 0.7,
    textDecorationLine: 'underline'
  },
  resendTextDisabled: {
    opacity: 0.3
  }
});