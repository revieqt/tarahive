import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { useInternetConnection } from '@/shared/utils/checkInternetConnection';
import HomeHeaderCard from '@/shared/components/cards/HomeHeaderCard';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { TARA_AI_SUGGESTIONS } from '@/shared/constants/Tara';

const HomeOptions = [
  { icon: 'map-marker-radius', label: 'Routes', route: '/routes/routes' },
  { icon: 'calendar', label: 'Itineraries', route: '/itineraries/itineraries' },
  { icon: 'shield-plus', label: 'Safety', route: '/sos' },
  { icon: 'qrcode-scan', label: 'Scan QR', route: '/camera/qr-scan', requiresConnection: true },
];

export default function HomeScreen() {
  const isConnected = useInternetConnection();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');
  const [searchAi, setSearchAi] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const randomSuggestion = TARA_AI_SUGGESTIONS[Math.floor(Math.random() * TARA_AI_SUGGESTIONS.length)];
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < randomSuggestion.length) {
        setSearchAi(randomSuggestion.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);
  return (
    <TView style={{ flex: 1 }}>
      <HomeHeaderCard />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          <LinearGradient colors={['transparent', backgroundColor, backgroundColor]} style={styles.menuGradient}/>
          <View style={styles.searchContainer}>
            <View style={[styles.searchFieldContainer, styles.shadow, {backgroundColor: primaryColor}]}>
              <TextInput
                value={searchAi}
                onChangeText={setSearchAi}
                autoCapitalize="words"
                style={[styles.searchField, {color: textColor}]}
              />

              <TouchableOpacity>
                <TIcon name='send' size={18} color={searchAi ? secondaryColor : '#ccc4'}/>
              </TouchableOpacity>
            </View>
            

            <TouchableOpacity style={[styles.notificationButton, styles.shadow,{backgroundColor: primaryColor}]}>
              <TIcon name='bell' size={20} color={textColor}/>
            </TouchableOpacity>
          </View>
          
          <View style={styles.menu}>
            {HomeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuOptions,styles.shadow, {backgroundColor: primaryColor}]}
                onPress={() => router.push(option.route)}
                disabled={option.requiresConnection && !isConnected}
              >
                <TIcon name={option.icon} size={25} color={secondaryColor}/>
                <TText style={styles.menuOptionText}>{option.label}</TText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TView style={styles.gridContainer}>
          <TouchableOpacity 
            onPress={() => router.push('/veehive')}
            style={[styles.gridChildContainer, styles.leftGridContainer, styles.shadow, {backgroundColor: primaryColor}]}
          >
            <View style={{padding: 12}}>
              <TText style={{opacity: .5, fontSize: 10}}>Meet your AI buddy</TText>
              <TText style={{opacity: .85, fontSize: 16}}>Tara</TText>
            </View>
            
            <LinearGradient
              colors={[accentColor+'60', 'transparent']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={styles.gridCircle}
              pointerEvents="none"
            />
            <Image source={require('@/shared/assets/images/icon.png')} style={styles.aiImage} />
          </TouchableOpacity>
          <View
            style={[styles.gridChildContainer, styles.leftGridContainer]}>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/explore')}
              style={[styles.rightGridContainer, styles.shadow, {backgroundColor: primaryColor}]}
            >
              <TText style={{opacity: .5, fontSize: 10}}>Seamless group</TText>
              <TText style={{opacity: .85}}>Rooms</TText>
              <LinearGradient
                colors={[accentColor+'60', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.rightGridCircle}
                pointerEvents="none"
              />
              <Image source={require('@/shared/assets/images/slide4-img.png')} style={styles.rightGridImage} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/explore')}
              style={[styles.rightGridContainer, styles.shadow, {backgroundColor: primaryColor}]}
            >
              <TText style={{opacity: .5, fontSize: 10}}>Meet new friends with</TText>
              <TText style={{opacity: .85}}>TaraBuddy</TText>
              <LinearGradient
                colors={[accentColor+'60', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.rightGridCircle}
                pointerEvents="none"
              />
              <Image source={require('@/shared/assets/images/slide3-img.png')} style={styles.rightGridImage} />
            </TouchableOpacity>
          </View>
        </TView>
      </ScrollView>
      {/* <SidebarAlerts /> */}
    </TView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    paddingTop: 185,
  },
  menuContainer:{
    position: 'relative',
    zIndex: 100,
  },
  searchContainer:{
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: '3%',
    marginBottom: '2%',
    zIndex: 1000,
    opacity: .9,
  },
  searchFieldContainer:{
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    overflow: 'hidden'
  },
  searchField:{
    fontFamily: 'Inter',
    fontSize: 11,
    paddingHorizontal: 12,
    flex: 1,
  },
  notificationButton:{
    height: 40,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#ccc7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuGradient: {
    height: '90%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  menu:{
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: '2%',
    zIndex: 2000,
    paddingHorizontal: '3%',
    gap: '2%',
  },
  menuOptions:{
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    borderRadius: 10,
    paddingTop: 5,
    zIndex: 1002,
  },
  shadow:{
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuOptionText:{
    fontSize: 9,
    marginTop: 5,
    opacity: 0.6,
  },
  gridContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: '3%',
    zIndex: 100,
    gap: '2%',
  },
  gridChildContainer:{
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    gap: '5%',
  },
  leftGridContainer:{
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc0'
  },
  rightGridContainer:{
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc0',
    padding: 12,
  },
  gridCircle:{
    height: '150%',
    aspectRatio: 1,
    borderRadius: 1000,
    position: 'absolute',
    bottom: '-75%',
    right: '-50%',
  },
  rightGridCircle:{
    height: '170%',
    aspectRatio: 1,
    borderRadius: 1000,
    position: 'absolute',
    bottom: '-60%',
    right: '-20%',
  },
  aiImage:{
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: '-20%',
    right: '-30%',
    opacity: .9,
  },
  rightGridImage:{
    width: '55%',
    height: '150%',
    position: 'absolute',
    bottom: '-45%',
    right: '-15%',
    opacity: .8,
  },
});