import { StyleSheet, View, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import PasswordField from '@/components/PasswordField';
import { useState } from 'react';
import GradientBlobs from '@/components/GradientBlobs';
import Wave from '@/components/Wave';
import { useRouter } from 'expo-router';  
import { useInternetConnection } from '@/utils/checkInternetConnection';
import { CustomAlert } from '@/components/Alert';
import { useAuthLogin } from '@/context/SessionContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import ThemedIcons from '@/components/ThemedIcons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showNoInternetAlert, setShowNoInternetAlert] = useState(false);
  const router = useRouter();
  const isConnected = useInternetConnection();
  const secondaryColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  
  // Use the auth hooks
  const { login, loading, error } = useAuthLogin();
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();

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
      console.log(err);
      setErrorMsg(err.message || 'Google Sign-in failed');
    }
  };

  const handleRegisterRedirect = () => {
    if (!isConnected) {
      setShowNoInternetAlert(true);
    } else {
      router.push('/auth/register');
    }
  };

  const handleLogin = async () => {
    if (!isConnected) {
      setShowNoInternetAlert(true);
      return;
    }
 
    if (!email || !password) {
      setErrorMsg('Email and password are required');
      return;
    }

    setErrorMsg('');

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
      setErrorMsg(err.message || 'Login failed');
    }
  };

  const handleforgotPassword = () => {
    if (!isConnected) {
      setShowNoInternetAlert(true);
    } else {
      router.push('/auth/forgotPassword');
    }
  };

  return (
    <ThemedView style={{flex: 1}} color='primary'>
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
          <ThemedView style={styles.headerContainer} color='secondary'>
            <GradientBlobs />
            <ThemedText type='title' style={{color: '#fff'}}>Smart Plans</ThemedText>
            <ThemedText style={{color: '#fff'}}>
              Safer Journeys, Travel with TaraG!
            </ThemedText>
            <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .35 }} color={secondaryColor} height={230} amplitude={40}/>
          </ThemedView>

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
            <ThemedView style={styles.formContainer} color='primary'>
              

              <TouchableOpacity
                onPress={handleforgotPassword}
              >
                <ThemedText style={{ textAlign: 'right', opacity: .7}}>
                  Forgot Password?
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={{ textAlign: 'center', color: 'red'}}>{errorMsg || error || googleError || ''}</ThemedText>

              <Button
                title={loading ? 'Logging in...' : 'Login'}
                onPress={handleLogin}
                type="primary"
                loading={loading}
                buttonStyle={{ width: '100%', marginTop: 10 }}
              />
              {/* <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={googleLoading}>
                <ThemedIcons name="google-plus" size={20}/>
                <ThemedText style={{ marginLeft: 8}}>{googleLoading ? 'Signing in...' : 'Sign in with Google'}</ThemedText>
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={handleRegisterRedirect}>
                <ThemedText style={{textAlign: 'center', marginTop: 10, opacity: .7}}>Dont have an account yet? Register</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={showNoInternetAlert}
        title="No Internet Connection"
        message="You need an internet connection to create an account. Please check your connection and try again."
        icon="warning-outline"
        fadeAfter={3000}
        onClose={() => setShowNoInternetAlert(false)}
        buttons={[
          { text: 'OK', style: 'default', onPress: () => setShowNoInternetAlert(false) }
        ]}
      />
      
    </ThemedView>
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
