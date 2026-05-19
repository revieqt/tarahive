import Button from '@/shared/components/ui/Button';
import { TView } from '@/shared/components/ui/Themed';
import React, { useState} from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet } from 'react-native';
import { useEmailVerification } from '@/features/auth/hooks/useRegister';
import HiveBg from '@/shared/components/common/HiveBg';
import LangButton from '@/shared/components/common/LanguageButton';
import { useLanguage } from '@/shared/context/LanguageContext';
import CodeInputField from '@/shared/components/ui/CodeInputField';
import Header from '@/shared/components/common/Header';

export default function VerifyEmailScreen() {
  const [verificationCode, setVerificationCode] = useState('');
  const { t } = useLanguage();
  const { sendCode, verifyCode, loading: verificationLoading } = useEmailVerification();

  return (
    <TView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%' }}
      >
        <HiveBg/>
        <LangButton/>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 16}}>
          <Header title={t("auth.verify_email.title")} subtitle={t("auth.verify_email.subtitle")}/>
        
          <CodeInputField
            value={verificationCode}
            onChangeText={setVerificationCode}
            characters={6}
            type="numeric"
          />
        </ScrollView>

        <View style={styles.completeButton}>
          <Button
            title={t("auth.verify_email.resend_prompt")}
            onPress={() => []}
            disabled={verificationLoading}
          />

          <Button
            title={t("auth.register.register_button")}
            onPress={() => []}
            type="primary"
            disabled={!verificationCode || verificationLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </TView>
  );
}

const styles = StyleSheet.create({
  completeButton:{
    position: 'absolute',
    bottom: 16,
    right: 16,
    left: 16,
    zIndex: 100,
    gap: 8,
  },
});
