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
import HiveBg from '@/shared/components/common/HiveBg';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const { t } = useLanguage();
  const { login, isPending } = useLogin();

  const handleLogin = () => {
    login(
      { identifier: email, password },
      {
        onSuccess: () => {
          router.replace('/(protected)/(tabs)/home');
        },
      }
    );
  };

  const isFormValid = email && password;

  return (
    <TView style={{ flex: 1 }}>
      <LinearGradient
        colors={[secondaryColor, accentColor]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header stays fixed — outside the KeyboardAvoidingView */}
      <View style={styles.headerContainer}>
        <TText type="title" style={styles.headerTitle}>
          {t("auth.login.title")}
        </TText>
        <TText type="subtitle" style={styles.headerSubtitle}>
          {t("auth.login.subtitle")}
        </TText>
        <HiveBg/>
      </View>

      {/* Only the card area moves with the keyboard */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <TView style={styles.card} color="primary">
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

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordButton}
            >
              <TText style={{opacity: 0.6}}>
                {t("auth.login.forgot_password_prompt")}
              </TText>
            </TouchableOpacity>

            <Button
              title={t("auth.login.login_button")}
              onPress={handleLogin}
              type="primary"
              loading={isPending}
              disabled={!isFormValid || isPending}
              buttonStyle={{marginVertical: 8}}
            />

            <Button
              title={t("auth.login.login_button")}
              onPress={() => []}
              loading={isPending}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.registerButton}
            >
              <TText style={styles.registerText}>
                {t("auth.login.register_prompt")}
              </TText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordButton}
            >
              <TText style={{opacity: 0.6}}>
                {t("auth.login.forgot_password_prompt")}
              </TText>
            </TouchableOpacity>
          </TView>
        </ScrollView>
      </KeyboardAvoidingView>
    </TView>
  );
}

const styles = StyleSheet.create({
  langButtonWrapper: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 200,
  },
  headerContainer: {
    height: '42%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoDot: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 6,
  },
  keyboardAvoider: {
    flex: 1,
    marginTop: '-6%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    padding: '3%',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    opacity: 0.6,
    fontSize: 13,
  },
  loginButton: {
    width: '100%',
    marginTop: 8,
    borderRadius: 16,
    height: 52,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.25)',
  },
  dividerText: {
    opacity: 0.5,
    fontSize: 12,
  },
  registerButton: {
    alignSelf: 'center',
  },
  registerText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});