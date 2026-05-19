import Button from '@/shared/components/ui/Button';
import DatePickerField from '@/shared/components/ui/DatePickerField';
import DropDownField from '@/shared/components/ui/DropDownField';
import PasswordField from '@/shared/components/ui/PasswordField';
import TextField from '@/shared/components/ui/TextField';
import { TText, TView } from '@/shared/components/ui/Themed';
import { calculateAge } from '@/shared/utils/calculateAge';
import { router } from 'expo-router';
import React, { useRef, useState} from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, Animated, Dimensions, StyleSheet } from 'react-native';
import { GENDER_OPTIONS } from '@/shared/constants/Input';
import { useRegister, useEmailVerification } from '@/features/auth/hooks/useRegister';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import HiveBg from '@/shared/components/common/HiveBg';
import BackButton from '@/shared/components/common/BackButton';
import LangButton from '@/shared/components/common/LanguageButton';
import { showError } from '@/shared/services/toast.service';
import PasswordValidationCard from '@/shared/components/cards/PasswordValidationCard';
import { useLanguage } from '@/shared/context/LanguageContext';
import CodeInputField from '@/shared/components/ui/CodeInputField';

export default function VerifyEmailScreen() {
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
  const { t } = useLanguage();

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
    <TView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%' }}
      >
        <BackButton type='floating'/>
        <LangButton/>
        <View>
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
                  <TText type="title">{t("auth.register.title")}</TText>
                  <TText>{t("auth.register.subtitle")}</TText>
                </View>

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
                  onPress={handleNext}
                  type="primary"
                  loading={verificationLoading}
                  disabled={verificationLoading}
                  buttonStyle={{marginTop: 16}}
                />
              </ScrollView>
            </View>

            {/* Second Page */}
            <View style={{ height: screenHeight }}>
              <ScrollView
                style={{ width: screenWidth, padding: 16, zIndex: 2 }}
                contentContainerStyle={{ paddingBottom: 30 }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.headerContainer}>
                  <TText type="title">{t("auth.verify_email.title")}</TText>
                  <TText>{t("auth.verify_email.subtitle")} {email}</TText>
                </View>

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
                  onPress={handleNext}
                  disabled={verificationLoading}
                />

                <Button
                  title={t("auth.register.register_button")}
                  onPress={handleRegister}
                  type="primary"
                  disabled={!verificationCode || verificationLoading || registerLoading}
                />
              </View>
            </View>
          </Animated.View>
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
  headerContainer: {
    marginTop: 40,
    marginBottom: 20
  },
  termsText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7
  }
});
