import Button from '@/components/ui/Button';
import DatePickerField from '@/components/ui/DatePickerField';
import DropDownField from '@/components/ui/DropDownField';
import PasswordField from '@/components/ui/PasswordField';
import TextField from '@/components/ui/TextField';
import { TText} from '@/components/ui/Themed';
import React, { useRef, useState} from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity, 
  View, 
  StyleSheet

} from 'react-native';
import { GENDER_OPTIONS } from '@/shared/constants/Config';
import { useEmailVerification } from '@/features/auth/hooks/useAuth';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { useLanguage } from "@/shared/context/LanguageContext";
import Header from '@/components/common/Header';
import HiveBg from '@/components/common/HiveBg';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [bdate, setBdate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const { t } = useLanguage();
  const { sendCode, loading } = useEmailVerification();

  const handleEmailVerification = async () => {
    if (
      fname ||
      bdate ||
      gender ||
      email ||
      password ||
      confirmPassword
    ){
      await sendCode(email);
      router.push({
        pathname: '/auth/email-verification' as any,
        params: { fname, lname, bdate: bdate?.toISOString(), gender, email, password, confirmPassword }
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, width: '100%'}}
    >
      <HiveBg />
      <ScrollView
        ref={scrollRef}
        style={{ padding: 16, zIndex: 2 }}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Header title={t('register.title')} subtitle={t('register.subtitle')} />

          <TextField
            placeholder={t('register.fname')}
            value={fname}
            onChangeText={setFname}
            autoCapitalize="words"
          />

          <TextField
            placeholder={t('register.lname')}
            value={lname}
            onChangeText={setLname}
            autoCapitalize="words"
          />

          <DatePickerField
            placeholder={t('register.bdate')}
            value={bdate}
            onChange={setBdate}
            maximumDate={new Date()}
          />

          <DropDownField
            placeholder={t('register.gender')}
            value={gender}
            onValueChange={setGender}
            values={GENDER_OPTIONS}
            style={{ marginBottom: 15 }}
          />

          <TextField
            placeholder={t('register.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PasswordField
            placeholder={t('register.password')}
            value={password}
            onChangeText={setPassword}
          />

          <PasswordField
            placeholder={t('register.confirm_password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity onPress={() => []}>
            <TText style={styles.terms}>{t('register.terms_prompt')}</TText>
          </TouchableOpacity>

          <Button
            title={t('register.register_button')}
            onPress={handleEmailVerification}
            loading={loading}
            type="primary"
            disabled={!fname || !bdate || !gender || !email || !password || !confirmPassword}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  terms:{
    textAlign: 'center',
    opacity: .5,
    fontSize: 12,
    marginVertical: 16,
  }
});
