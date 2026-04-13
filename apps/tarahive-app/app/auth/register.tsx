import Button from '@/components/Button';
import ContactNumberField from '@/components/ContactNumberField';
import DatePicker from '@/components/DatePicker';
import DropDownField from '@/components/DropDownField';
import PasswordField from '@/components/PasswordField';
import TextField from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { calculateAge } from '@/utils/calculateAge';
import ProcessModal from '@/components/modals/ProcessModal';
import { router } from 'expo-router';
import React, { useRef, useState} from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity, 
  View, 
  Animated, 
  Dimensions, 
  StyleSheet

} from 'react-native';
import { openDocument } from '@/utils/documentUtils';
import ThemedIcons from '@/components/ThemedIcons';
import RoundedButton from '@/components/RoundedButton';
import { GENDER_OPTIONS } from '@/constants/Config';
import { useAuthRegister } from '@/context/SessionContext';
import Wave from '@/components/Wave';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function RegisterScreen() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [bdate, setBdate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [areaCode, setAreaCode] = useState('+63');
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const accentColor = useThemeColor({}, 'accent');

  // Use the auth hook
  const { register, loading, error } = useAuthRegister();

  // Animation states
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [currentPage, setCurrentPage] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Check if first page is complete
  const isFirstPageComplete = () => {
    if (!fname || !bdate || !gender) return false;
    const age = bdate ? calculateAge(bdate) : 0;
    if (age < 13) return false;
    return true;
  };

  const handleNext = () => {
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(1);
    });
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

  const handleBackButtonPress = () => {
    if (currentPage === 1) {
      handleBack();
    } else {
      router.back();
    }
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
      await register({
        fname,
        lname: lname || undefined,
        bdate: bdate!.toISOString(),
        gender,
        contactNumber: contactNumber ? areaCode + contactNumber : undefined,
        username,
        email,
        password,
      });

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
      <TouchableOpacity onPress={handleBackButtonPress} style={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>
        <ThemedIcons name="arrow-left" size={24}/>
      </TouchableOpacity>
      <ThemedView color='primary'>
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
                <ThemedText type="title">
                  Join our Community!
                </ThemedText>
                <ThemedText>
                  Only 13 years old and above are allowed to register
                </ThemedText>
              </View>
              

              {errorMsg ? (
                <ThemedText style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</ThemedText>
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

              <DatePicker
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

              <ContactNumberField
                areaCode={areaCode}
                onAreaCodeChange={setAreaCode}
                number={contactNumber}
                onNumberChange={setContactNumber}
                placeholder="Phone (optional)"
                style={{ marginBottom: 15 }}
              />
              
            </ScrollView>
            <RoundedButton
              iconName="arrow-right"
              onPress={handleNext}
              style={styles.proceedButton}
              disabled={!isFirstPageComplete()}
            />
            <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>
          </View>


          {/* Second Page */}
          <View style={{ height: screenHeight }}>
            <ScrollView
              style={{ width: screenWidth, padding: 16, zIndex: 2 }}
              contentContainerStyle={{ paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerContainer}>
                <ThemedText type="title">
                  Set-up Credentials
                </ThemedText>
                {errorMsg ? (
                  <ThemedText style={{ color: 'red'}}>{errorMsg}</ThemedText>
                ) : (<ThemedText>You cannot change your username later</ThemedText>)}
              </View>

              <TextField
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
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
              
            </ScrollView>
            <View style={styles.createAccountButton}>
              <TouchableOpacity onPress={() => openDocument('terms-mobileApp')}>
                <ThemedText style={{textAlign: 'center', opacity: .5, fontSize: 11}}>By creating an account, you agree to our</ThemedText>
                <ThemedText style={{textAlign: 'center', textDecorationLine: 'underline', opacity: .5, fontSize: 11}}>Terms & Conditions</ThemedText>
              </TouchableOpacity>
              <Button
                title={loading ? 'Creating Account...' : 'Create Account'}
                onPress={handleRegister}
                type="primary"
                disabled={!fname || !bdate || !gender || !username || !email || !password || !confirmPassword}
              />
            </View>
            <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>
          </View>
          
        </Animated.View>
        
      </ThemedView>
      <ProcessModal
        visible={showModal}
        status={modalStatus}
        message={modalStatus === 'success' ? 'Account Created Successfully!' : 'Creating Account...'}
        onClose={() => {
          setShowModal(false);
          if (modalStatus === 'success') {
            router.replace('/auth/login');
          }
        }}
      />
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  createAccountButton:{
    position: 'absolute',
    bottom: 80,
    right: 16,
    left: 16,
    gap: 16,
    zIndex: 100
  },
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
