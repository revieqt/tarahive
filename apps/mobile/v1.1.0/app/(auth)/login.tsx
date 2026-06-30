import { StyleSheet, View, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import { TText, TView } from '@/shared/components/ui/Themed';
import Button from '@/shared/components/ui/Button';
import TextField from '@/shared/components/ui/TextField';
import PasswordField from '@/shared/components/ui/PasswordField';
import { useState } from 'react';
import { useRouter } from 'expo-router';  
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import LangButton from '@/shared/components/common/LanguageButton';
import { useLanguage } from '@/shared/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const { t } = useLanguage();
  const { login, isPending } = useLogin();

  const handleLogin = () => {
    login(
      { identifier: email, password },
      { onSuccess: () => {
          router.replace('/(protected)/(tabs)/home');
        },
      }
    );
  };

  const isFormValid = email && password;

  return (
    <TView style={{flex: 1}}>
      <LangButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TView style={styles.headerContainer} color='secondary'>
            <TText type='title' style={{color: '#fff'}}>{t("auth.login.title")}</TText>
            <TText type='subtitle' style={{color: '#fff', textAlign: 'center'}}>{t("auth.login.subtitle")}</TText>
          </TView>

          <View style={styles.contentContainer}>
            <LinearGradient
              colors={['transparent', primaryColor, primaryColor]}
              style={styles.formGradient}
            >
              <TextField
                placeholder={t("auth.login.email")}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'email'}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <PasswordField
                placeholder={t("auth.login.password")}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'password'}
              />
            </LinearGradient>

            <TView style={styles.formContainer} color='primary'>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <TText style={{ textAlign: 'right', opacity: .7}}>
                  {t("auth.login.forgot_password_prompt")}
                </TText>
              </TouchableOpacity>
              
              <Button
                title={t("auth.login.login_button")}
                onPress={handleLogin}
                type="primary"
                loading={isPending}
                disabled={!isFormValid || isPending}
                buttonStyle={{ width: '100%', marginTop: 10 }}
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
              >
                <TText style={{textAlign: 'center', marginTop: 10, opacity: .7}}>
                  {t("auth.login.register_prompt")}
                </TText>
              </TouchableOpacity>
            </TView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: '55%',
    justifyContent: 'center',
    paddingBottom: '35%',
    alignItems: 'center',
  },
  contentContainer:{
    zIndex: 100,
    marginTop: '-52%',
  },
  formGradient:{
    paddingHorizontal: 16,
    paddingTop: '15%',
  },
  formContainer:{
    padding: 16,
    marginTop: -5,
  },
});
