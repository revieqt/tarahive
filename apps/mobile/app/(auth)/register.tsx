import Button from '@/components/ui/Button';
import DatePickerField from '@/components/ui/DatePickerField';
import DropDownField from '@/components/ui/DropDownField';
import PasswordField from '@/components/ui/PasswordField';
import TextField from '@/components/ui/TextField';
import { TText, TView, TIcon } from '@/components/ui/Themed';
import { calculateAge } from '@/shared/utils/calculateAge';
import { router } from 'expo-router';
import React, { useRef, useState} from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, Animated, Dimensions, StyleSheet } from 'react-native';
import { GENDER_OPTIONS } from '@/Config';
import { useRegister, useEmailVerification } from '@/features/auth/hooks/useRegister';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import HiveBg from '@/components/common/HiveBg';
import BackButton from '@/components/common/BackButton';
import LangButton from '@/components/common/LanguageButton';
import { showError } from '@/shared/services/toast.service';

export default function RegisterScreen() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [bdate, setBdate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Initialize hooks
  const { register, loading: registerLoading } = useRegister();
  const { sendCode, verifyCode, loading: verificationLoading } = useEmailVerification();

  // Animation states
  const slideAnim = useRef(new Animated.Value(0)).current;
  const accentColor = useThemeColor({}, 'accent');

  // Check if first page is complete
  const validateFirstPage = () => {
    if (!fname || !bdate || !gender) return false;
    const age = bdate ? calculateAge(bdate) : 0;
    if (age < 13) return false;
    return true;
  };

  const handleNext = async () => {
    try {
      setErrorMsg('');
      
      if (!validateFirstPage()) {
        showError('Validation Error', 'Please complete all required fields and ensure you are at least 13 years old.');
        return;
      }

      if (!email) {
        showError('Validation Error', 'Email is required');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError('Validation Error', 'Invalid email format');
        return;
      }

      if (!password || !confirmPassword) {
        showError('Validation Error', 'Password fields are required');
        return;
      }

      if (password !== confirmPassword) {
        showError('Validation Error', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        showError('Validation Error', 'Password must be at least 6 characters long');
        return;
      }

      // If email is not yet verified, send verification code
      if (!emailVerified) {
        const response = await sendCode(email);
        if (response) {
          setVerificationId(response.id);
        }
      }
      
      // Clear verification code and move to verification page
      setVerificationCode('');
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(1);
      });
    } catch (err: any) {
      // Error already shown by hook via toast
    }
  };

  const handleBack = () => {
    setVerificationCode('');
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(0);
    });
  };

  const handleRegister = async () => {
    try {
      setErrorMsg('');

      if (!verificationCode) {
        showError('Validation Error', 'Please enter the verification code');
        return;
      }

      // Verify the email code (hook will show toast on error)
      const verified = await verifyCode(email, verificationCode);
      if (!verified) {
        showError('Verification Failed', 'Invalid verification code');
        return;
      }

      // If verification is successful, proceed with registration
      setEmailVerified(true);
      
      const response = await register({
        fname,
        lname: lname || undefined,
        bdate: bdate!.toISOString(),
        gender,
        email,
        password,
        confirmPassword,
        isVerified: true,
      });

      if (response) {
        showError('Success', 'Account created successfully! Redirecting to login...');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
      }
    } catch (err: any) {
      // Registration failed, but email is already verified
      // Show error and go back to form
      showError('Registration Failed', err.message || 'Failed to create account');
      
      // Go back to first page
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(0);
      });
      // Email is already verified, so next time they click continue, it won't resend
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, width: '100%' }}
    >
      <BackButton type='floating'/>
      <LangButton/>
      <TView color='primary'>
        <HiveBg/>
        <Animated.View 
          style={{
            width: screenWidth * 2,
            flexDirection: 'row',
            transform: [{ translateX: slideAnim }]
          }}
        >
          <View style={{ height: screenHeight }}>
            <ScrollView
              ref={scrollRef}
              style={{ width: screenWidth, padding: 16, zIndex: 2 }}
              contentContainerStyle={{ paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerContainer}>
                <TText type="title">
                  Join our Community!
                </TText>
                <TText>
                  Only 13 years old and above are allowed to register
                </TText>
              </View>

              <TextField
                placeholder="First Name"
                value={fname}
                onChangeText={setFname}
                autoCapitalize="words"
              />

              <TextField
                placeholder="Last Name (optional)"
                value={lname}
                onChangeText={setLname}
                autoCapitalize="words"
              />

              <DatePickerField
                placeholder="Birthdate"
                value={bdate}
                onChange={setBdate}
                maximumDate={new Date()}
              />

              <DropDownField
                placeholder="Gender"
                value={gender}
                onValueChange={setGender}
                values={GENDER_OPTIONS}
                style={{ marginBottom: 15 }}
              />

              <TextField
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <PasswordField
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
              />

              <PasswordField
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity onPress={() => []}>
                <TText style={{textAlign: 'center', opacity: .5, fontSize: 11}}>By creating an account, you agree to our</TText>
                <TText style={{textAlign: 'center', textDecorationLine: 'underline', opacity: .5, fontSize: 11}}>Terms & Conditions</TText>
              </TouchableOpacity>

              <Button
                title={verificationLoading ? 'Sending Code...' : 'Create Account'}
                onPress={handleNext}
                type="primary"
                disabled={verificationLoading}
                buttonStyle={{marginTop: 16}}
              />
              
            </ScrollView>
            {/* <RoundedButton
              iconName="arrow-right"
              onPress={handleNext}
              style={styles.proceedButton}
              disabled={!isFirstPageComplete()}
            />
            <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/> */}
          </View>


          {/* Second Page */}
          <View style={{ height: screenHeight }}>
            <ScrollView
              style={{ width: screenWidth, padding: 16, zIndex: 2 }}
              contentContainerStyle={{ paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerContainer}>
                <TText type="title">
                  Verify Your Email
                </TText>
                <TText>
                  A verification code has been sent to {email}. Please enter it to continue.
                </TText>
              </View>

              <TextField
                placeholder="Enter verification code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                autoCapitalize="none"
                keyboardType="default"
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Back"
                    onPress={handleBack}
                    type="primary"
                    disabled={verificationLoading || registerLoading}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={registerLoading ? 'Creating...' : 'Complete Registration'}
                    onPress={handleRegister}
                    type="primary"
                    disabled={!verificationCode || verificationLoading || registerLoading}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
          
        </Animated.View>
        
      </TView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  proceedButton:{
    position: 'absolute',
    bottom: 50,
    right: 16,
    zIndex: 100
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 20
  },
});
