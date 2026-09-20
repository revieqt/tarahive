import Button from '@/components/ui/Button';
import { TText, TView } from '@/components/ui/Themed';
import React, { useState, useEffect} from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useEmailVerification } from '@/hooks/auth/useEmailVerification';
import { useLanguage } from '@/context/LanguageContext';
import CodeInputField from '@/components/ui/CodeInputField';
import Header from '@/components/common/Header';
import TextField from '@/components/ui/TextField';
import { showError } from '@/services/toast.service';

const RESEND_COOLDOWN_MS = 3 * 60 * 1000;

export default function EmailAuthScreen() {
  const [email, setEmail] = useState('');
  const [steps, setSteps] = useState<'email' | 'code'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);
  const { t } = useLanguage();
  const { sendCode, verifyCode, isSendingCode, isVerifying } = useEmailVerification();
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);


  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => Math.max(0, prev - 1000));
      }, 1000);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [cooldownTime]);


  const handleContinue = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showError('Email required', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      showError('Invalid email', 'Please enter a valid email address');
      return;
    }
    
    try {
      await sendCode(trimmedEmail);
      setSteps('code');
      setCooldownTime(RESEND_COOLDOWN_MS);
    } catch {
      // The hook displays the request error.
    }
  };


  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) return;

    try {
      await sendCode(trimmedEmail);
      setCooldownTime(RESEND_COOLDOWN_MS);
    } catch {
      // The hook displays the request error.
    }
  };


  const handleVerify = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail) || !verificationCode) return;

    verifyCode({ email: trimmedEmail, code: verificationCode });
  };


  const formatCooldownTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  const isResendDisabled = cooldownTime > 0 || isSendingCode;
  const isVerifyDisabled = !verificationCode || isVerifying;
  const isEmailButtonDisabled = !email.trim() || !isValidEmail(email.trim());


  if (steps === 'email') {
    return (
      <TView style={{flex: 1, padding: '3%'}}>
        <Header title={t("common.email_login.title1")} subtitle={t("common.email_login.subtitle1")}/>
      
        <TextField
          value={email}
          onChangeText={setEmail}
          placeholder={t("common.email_login.email_placeholder")}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.buttonsContainer}>
          <Button
            title={t("common.common.continue")}
            onPress={handleContinue}
            type="primary"
            disabled={isEmailButtonDisabled}
            loading={isSendingCode}
            buttonStyle={{ width: '100%' }}
          />
        </View>
      </TView>
    );
  }


  return (
    <TView style={{flex: 1, padding: '3%'}}>
      <Header title={t("common.email_login.title2")} subtitle={t("common.email_login.subtitle2") + email}/>
      
      <CodeInputField
        value={verificationCode}
        onChangeText={setVerificationCode}
        characters={6}
        type="numeric"
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleResend}
          disabled={isResendDisabled || isSendingCode}
        >
          <TText style={{ opacity: isResendDisabled ? 0.5 : 1, textAlign: 'center' }}>
            {
              isResendDisabled && cooldownTime > 0
                ? `${t("common.email_login.cooldown_prompt")} ${formatCooldownTime(cooldownTime)}`
                : t("common.email_login.resend_prompt")
            }
          </TText>
        </TouchableOpacity>

        <Button
          title={t("common.email_login.verify_button")}
          onPress={handleVerify}
          type="primary"
          disabled={isVerifyDisabled}
          loading={isVerifying}
          buttonStyle={{ width: '100%' }}
        />
      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  buttonsContainer:{
    position: 'absolute',
    bottom: 16,
    right: '3%',
    left: '3%',
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
