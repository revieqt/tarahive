import Button from '@/shared/components/ui/Button';
import { TText, TView } from '@/shared/components/ui/Themed';
import React, { useState, useEffect} from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useEmailVerification } from '@/features/auth/hooks/useEmailVerification';
import HiveBg from '@/shared/components/common/HiveBg';
import LangButton from '@/shared/components/common/LanguageButton';
import { useLanguage } from '@/shared/context/LanguageContext';
import CodeInputField from '@/shared/components/ui/CodeInputField';
import Header from '@/shared/components/common/Header';
import { router } from 'expo-router';
import TextField from '@/shared/components/ui/TextField';

const RESEND_COOLDOWN_MS = 3 * 60 * 1000;

export default function ForgotPasswordScreen() {
  const [verificationCode, setVerificationCode] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);
  const [ email, setEmail] = useState('');
  const { t } = useLanguage();
  
  const {
    sendCode,
    verifyCode,
    isSendingCode,
    isVerifying,
  } = useEmailVerification();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => Math.max(0, prev - 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownTime]);

  const handleResend = () => {
    if (!email) return;

    sendCode(email, {
      onSuccess: () => {
        setCooldownTime(RESEND_COOLDOWN_MS);
      },
    });
  };

  const handleVerify = () => {
    if (!email || !verificationCode) return;

    verifyCode(
      { email, code: verificationCode },
      {
        onSuccess: () => {
          setVerificationCode('');
          router.replace('/(auth)/login');
        },
      }
    );
  };

  const formatCooldownTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isResendDisabled = cooldownTime > 0 || isSendingCode;
  const isVerifyDisabled = !verificationCode || isVerifying;

  return (
    <TView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%' }}
      >
        <HiveBg/>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 16}}>
          <Header 
            title={email ? t("auth.verify_email.title") : "Forgot Password"} 
            subtitle={email ? t("auth.verify_email.subtitle") + email : "Use your email to receive a verification code."}
          />

          { email ? (
            <CodeInputField
              value={verificationCode}
              onChangeText={setVerificationCode}
              characters={6}
              type="numeric"
            />
          ):(
            <TextField
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        
          
        </ScrollView>

        <View style={styles.buttonsContainer}>
          {email ? <>
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResendDisabled || isSendingCode}
            >
              <TText style={{ opacity: isResendDisabled ? 0.5 : 1, textAlign: 'center' }}>
                {
                  isResendDisabled && cooldownTime > 0
                    ? `Email resent. You can request another one in ${formatCooldownTime(cooldownTime)}`
                    : t("auth.verify_email.resend_prompt")
                }
              </TText>
            </TouchableOpacity>

            <Button
              title={t("auth.verify_email.verify_button") || t("auth.register.register_button")}
              onPress={handleVerify}
              type="primary"
              disabled={isVerifyDisabled}
              loading={isVerifying}
              buttonStyle={{ width: '100%' }}
            />
          </>
          :(
            <Button
              title={t("auth.verify_email.verify_button") || t("auth.register.register_button")}
              onPress={handleVerify}
              type="primary"
              disabled={isVerifyDisabled}
              loading={isVerifying}
              buttonStyle={{ width: '100%' }}
            />
          )}
          
        </View>
      </KeyboardAvoidingView>
    </TView>
  );
}

const styles = StyleSheet.create({
  buttonsContainer:{
    position: 'absolute',
    bottom: 16,
    right: 16,
    left: 16,
    zIndex: 100,
    gap: 16,
    alignItems: 'center',
  },
  emailContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    opacity: 0.8,
  },
  emailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
