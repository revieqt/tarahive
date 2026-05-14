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
import { GENDER_OPTIONS } from '@/shared/constants/Config';
// import { useAuthRegister } from '@/feature/auth/context/SessionContext';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import HiveBg from '@/components/common/HiveBg';
import BackButton from '@/components/common/BackButton';
import LangButton from '@/components/common/LanguageButton';

export default function RegisterScreen() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [bdate, setBdate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const accentColor = useThemeColor({}, 'accent');

  // Use the auth hook
  // const { register, loading, error } = useAuthRegister();

  // Animation states
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [currentPage, setCurrentPage] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Check if first page is complete
  const validateFirstPage = () => {
    if (!fname || !bdate || !gender) return false;
    const age = bdate ? calculateAge(bdate) : 0;
    if (age < 13) return false;
    return true;
  };

  const handleNext = () => {
    try {
      if (!validateFirstPage()) {
        setErrorMsg('Please complete all required fields and ensure you are at least 13 years old.');
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }

      if (emailVerified) handleRegister();

      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(1);
      });
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    
  };

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(0);
    });
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (
      !fname ||
      !bdate ||
      !gender ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setErrorMsg('Required fields must not be empty.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const age = calculateAge(bdate as Date);
    if (age < 13) {
      setErrorMsg('You must be at least 13 years old to register.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Invalid email format.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // Password strength validation
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    try {
      setShowModal(true);
      setModalStatus('processing');
      // await register({
      //   fname,
      //   lname: lname || undefined,
      //   bdate: bdate!.toISOString(),
      //   gender,
      //   contactNumber: contactNumber ? areaCode + contactNumber : undefined,
      //   username,
      //   email,
      //   password,
      // });

      setModalStatus('success');
      setSuccess(true);
    } catch (err: any) {
      setModalStatus('error');
      setShowModal(true);
      setErrorMsg(err.message || 'Registration failed');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
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
              

              {errorMsg ? (
                <TText style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</TText>
              ) : null}

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
                title={ 'Create Account'}
                onPress={handleNext}
                type="primary"
                // disabled={!fname || !bdate || !gender || !email || !password || !confirmPassword}
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
                  A verification link has been sent to {email}. Please verify to continue.
                </TText>
              </View>

              <TextField
                placeholder="XXXXXX"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              
            </ScrollView>

            <Button
              title="Complete Registration"
              onPress={handleRegister}
              type="primary"
              disabled={!fname || !bdate || !gender || !username || !email || !password || !confirmPassword}
              buttonStyle={styles.createAccountButton}
            />
          </View>
          
        </Animated.View>
        
      </TView>
      {/* <ProcessModal
        visible={showModal}
        status={modalStatus}
        message={modalStatus === 'success' ? 'Account Created Successfully!' : 'Creating Account...'}
        onClose={() => {
          setShowModal(false);
          if (modalStatus === 'success') {
            router.replace('/auth/login');
          }
        }}
      /> */}
      
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
  createAccountButton:{
    position: 'absolute',
    bottom: 16,
    right: 16,
    left: 16,
    zIndex: 100
  },
});
