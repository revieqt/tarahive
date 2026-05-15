import { StyleSheet, View, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import { TText, TView, TIcon } from '@/components/ui/Themed';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import PasswordField from '@/components/ui/PasswordField';
import { useState } from 'react';
import { useRouter } from 'expo-router';  
import { useInternetConnection } from '@/shared/utils/checkInternetConnection';
import { useAuthLogin } from '@/features/auth/context/SessionContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { showError, showInfo, showWarning } from '@/shared/services/toast.service';
import LangButton from '@/components/common/LanguageButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const router = useRouter();
  const isConnected = useInternetConnection();
  const secondaryColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  
  // Use the auth hooks
  const { login, loading, error } = useAuthLogin();

  const handleLogin = async () => {
    if (!isConnected) {
      showInfo('No Internet Connection', 'Please try again.');
      return;
    }
 
    if (!email || !password) {
      showWarning('Missing Fields', 'Please enter both email and password');
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.user.status === 'pending') {
        router.push({
          pathname: '/auth/verifyEmail' as any,
          params: { email: result.user.email }
        });
        return;
      }

      // Check if 2FA is enabled
      if (result.user.securitySettings?.is2FAEnabled) {
        router.push({
          pathname: '/auth/verifyEmail' as any,
          params: { 
            email: result.user.email, 
            is2FA: 'true',
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            userData: JSON.stringify(result.user)
          }
        });
        return;
      }

      if (result.user.isFirstLogin) {
        router.push('/account/firstLogin' as any);
      } else {
        router.replace('/home' as any);
      }
    } catch (err: any) {
      showError('Login Failed', err.message || 'An error occurred during login');
    }
  };

  return (
    <TView style={{flex: 1}} color='primary'>
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
            <TText type='title' style={{color: '#fff'}}>Smart Plans</TText>
            <TText style={{color: '#fff'}}>
              Safer Journeys, Travel with TaraG!
            </TText>
          </TView>

          <View style={styles.contentContainer}>
            <LinearGradient
              colors={[ 'transparent', primaryColor, primaryColor]}
              style={styles.formGradient}
            >
              <TextField
                placeholder="Email / Username"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'email'}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <PasswordField
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'password'}
              />

            </LinearGradient>
            <TView style={styles.formContainer} color='primary'>
              

              <TouchableOpacity
                onPress={() => router.push('/forgot-password')}
              >
                <TText style={{ textAlign: 'right', opacity: .7}}>
                  Forgot Password?
                </TText>
              </TouchableOpacity>
              
              <Button
                title={loading ? 'Logging in...' : 'Login'}
                // onPress={handleLogin}
                onPress={() => router.push('(tabs)/home')}
                type="primary"
                loading={loading}
                buttonStyle={{ width: '100%', marginTop: 10 }}
              />
              {/* <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={googleLoading}>
                <TIcon name="google-plus" size={20}/>
                <TText style={{ marginLeft: 8}}>{googleLoading ? 'Signing in...' : 'Sign in with Google'}</TText>
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={() => router.push('/register')}
              >
                <TText style={{textAlign: 'center', marginTop: 10, opacity: .7}}>Dont have an account yet? Register</TText>
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
  googleButton: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    marginBottom: 20
  }
});
