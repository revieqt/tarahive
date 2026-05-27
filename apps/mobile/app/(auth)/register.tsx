import Button from '@/shared/components/ui/Button';
import DatePickerField from '@/shared/components/ui/DatePickerField';
import DropDownField from '@/shared/components/ui/DropDownField';
import PasswordField from '@/shared/components/ui/PasswordField';
import TextField from '@/shared/components/ui/TextField';
import { TText, TView } from '@/shared/components/ui/Themed';
import { router } from 'expo-router';
import React, { useState} from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { GENDER_OPTIONS } from '@/shared/constants/Input';
import { useRegister } from '@/features/auth/hooks/useRegister';
import HiveBg from '@/shared/components/common/HiveBg';
import LangButton from '@/shared/components/common/LanguageButton';
import PasswordValidationCard from '@/shared/components/cards/PasswordValidationCard';
import { useLanguage } from '@/shared/context/LanguageContext';
import Header from '@/shared/components/common/Header';
import { StyleSheet } from 'react-native';

export default function RegisterScreen() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [bdate, setBdate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { t } = useLanguage();
  const { register, isPending } = useRegister();

  const handleRegister = () => {
    register(
      {
        fname,
        lname: lname || undefined,
        bdate: bdate!.toISOString(),
        gender,
        email,
        password,
        confirmPassword,
      },
      {
        onSuccess: (response) => {
          router.push({
            pathname: '/(auth)/verify',
            params: { email: response.email },
          } as any);
        },
      }
    );
  };

  const isFormValid = fname && bdate && gender && email && password && confirmPassword;

  return (
    <TView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%' }}
      >
        <LangButton/>
        <HiveBg/>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 16}}>
          <Header title={t("auth.register.title")} subtitle={t("auth.register.subtitle")}/>
        
          <TextField
            placeholder={t("auth.register.fname")}
            value={fname}
            onChangeText={setFname}
            autoCapitalize="words"
          />

          <TextField
            placeholder={t("auth.register.lname")}
            value={lname}
            onChangeText={setLname}
            autoCapitalize="words"
          />

          <DatePickerField
            placeholder={t("auth.register.bdate")}
            value={bdate}
            onChange={setBdate}
            maximumDate={new Date()}
          />

          <DropDownField
            placeholder={t("auth.register.gender")}
            value={gender}
            onValueChange={setGender}
            values={GENDER_OPTIONS}
          />

          <TextField
            placeholder={t("auth.register.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PasswordField
            placeholder={t("auth.register.password")}
            value={password}
            onChangeText={setPassword}
          />

          <PasswordField
            placeholder={t("auth.register.confirm_password")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <PasswordValidationCard password={password} confirmPassword={confirmPassword} withConfirmation/>

          <TouchableOpacity onPress={() => []}>
            <TText style={styles.termsText}>{t("auth.register.terms_prompt")}</TText>
          </TouchableOpacity>

          <Button
            title={t("common.common.continue")}
            onPress={handleRegister}
            type="primary"
            loading={isPending}
            disabled={!isFormValid || isPending}
            buttonStyle={{marginTop: 16}}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TView>
  );
}

const styles = StyleSheet.create({
  termsText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7
  }
});
