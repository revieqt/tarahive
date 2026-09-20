import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import LangButton from '@/components/common/LanguageButton';
import { useLanguage } from '@/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import HiveBg from '@/components/common/HiveBg';
import { Image } from 'expo-image';

export default function LoginScreen() {
  const router = useRouter();
  const accentColor = useThemeColor({}, 'accent');
  const { currentLanguage } = useLanguage();

  return (
    <TView style={{ flex: 1 }}>
      <TouchableOpacity style={styles.languageButton} onPress={() => router.push('/settings/language')}>
        <TText style={{color: '#fff'}}>{currentLanguage.code[0].toUpperCase() + currentLanguage.code.slice(1)}</TText>
        <TIcon name="earth" size={15} style={{color: '#fff'}} />
        
      </TouchableOpacity>

      <Image
        source={{ uri: 'https://laurenslighthouse.com/wp-content/uploads/2024/06/Moalboal01.jpg' }}
        style={{ flex: 1, width: '100%', height: '100%' }}
        contentFit="cover"
      />

      <LinearGradient
        colors={['transparent', '#1E201E', '#000']}
        style={styles.bottomContainer}
      >
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <TText style={styles.title}>Your Travels,</TText>
            <TText style={styles.titleAccent}>Made Easier</TText>
          </View>
          <TText style={styles.subtitle}>Welcome to Tarahive</TText>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
          <TIcon name="google" size={20} style={{color: accentColor}} />
          <TText style={{color: '#fff'}}>Continue with Google</TText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <TIcon name="apple" size={20} style={{color: accentColor}} />
          <TText style={{color: '#fff'}}>Continue with Apple</TText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login/email')}>
          <TText style={styles.emailOption}>Continue with Email</TText>
        </TouchableOpacity>

        <TouchableOpacity>
          <TText style={styles.termsText}>
            By continuing, you agree to our Terms & Conditions and Privacy Policy.
          </TText>
        </TouchableOpacity>

        <View style={styles.hiveBgContainer}>
          <HiveBg fade={false}/>
        </View>

      </LinearGradient>
    </TView>
    
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'center',
    columnGap: 7,
    rowGap: 2,
  },
  title: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '300',
    letterSpacing: -0.8,
  },
  titleAccent: {
    color: '#FFD166',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: '#FFFC',
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 5,
  },
  bottomContainer: {
    padding: '3%',
    paddingTop: 200,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fff2',
    gap: 8,
  },
  emailOption: {
    textAlign: 'center',
    paddingVertical: 10,
    color: '#fff',
    opacity: 0.7,
  },
  termsText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 11,
    color: '#fff7',
    textDecorationLine: 'underline',
  },
  hiveBgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    opacity: 0.2,
    overflow: 'hidden',
    zIndex: -1,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fff5',
    gap: 5,
    position: 'absolute',
    top: 20,
    right: '3%',
    zIndex: 10,
  },
});