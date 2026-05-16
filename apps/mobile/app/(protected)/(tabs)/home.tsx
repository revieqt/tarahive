import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import { useSession } from '@/features/auth/context/SessionContext';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View, Animated, Image } from 'react-native';
import { useInternetConnection } from '@/shared/utils/checkInternetConnection';
import HomeHeaderCard from '@/shared/components/cards/HomeHeaderCard';

const HomeOptions = [
  { icon: 'map-marker-radius', label: 'Routes', route: '/routes/routes' },
  { icon: 'calendar', label: 'Itineraries', route: '/itineraries/itineraries' },
  { icon: 'shield-plus', label: 'Safety', route: '/safety' },
  { icon: 'qrcode-scan', label: 'Scan QR', route: '/camera/qr-scan', requiresConnection: true },
];

export default function HomeScreen() {
  const isConnected = useInternetConnection();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');
  return (
    <TView style={{ flex: 1 }}>
      <HomeHeaderCard />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          <LinearGradient colors={['transparent', backgroundColor, backgroundColor]} style={styles.menuGradient}/>
          <View style={styles.menu}>
            {HomeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuOptions, {backgroundColor: primaryColor}]}
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
            onPress={() => router.push({
              pathname: '/ai/ai-chat',
            })}
            activeOpacity={0.8}
          >
            <TView color='primary' shadow style={[styles.gridChildContainer, styles.leftGridContainer]}>
              <TText style={{opacity: .5, fontSize: 10}}>Meet your AI buddy</TText>
              <TText style={{opacity: .85, fontSize: 16}}>Tara</TText>
              <LinearGradient
                colors={[accentColor+'60', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.gridCircle}
                pointerEvents="none"
              />
              <Image source={require('@/shared/assets/images/icon.png')} style={styles.aiImage} />
            </TView>
          </TouchableOpacity>
          <View style={[styles.gridChildContainer, {gap: '4%'}]}>
            <TView color='primary' shadow style={styles.rightGridContainer}>
              <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/(tabs)/explore',
              })}
              activeOpacity={0.8} style={{flex:1, padding: 12}}
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
            </TView>
            <TView color='primary' shadow style={styles.rightGridContainer}>
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/(tabs)/explore',
                params: { tab: '1' }
              })}
              activeOpacity={0.8} style={{flex: 1, padding: 12}}
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
            </TView>
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
    paddingTop: 130,
  },
  menuContainer:{
    position: 'relative',
    zIndex: 100,
  },
  menuGradient: {
    height: 120,
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
    marginBottom: 10,
    marginTop: 60,
    zIndex: 2000,
    paddingHorizontal: 16,
  },
  menuOptions:{
    width: Dimensions.get('window').width * 0.215,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    borderRadius: 10,
    paddingTop: 5,
    zIndex: 1002,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuOptionText:{
    fontSize: 10,
    marginTop: 5,
    opacity: 0.6,
  },
  gridContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  gridChildContainer:{
    width: Dimensions.get('window').width * 0.445,
    aspectRatio: 1,
    borderRadius: 12,
  },
  leftGridContainer:{
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc0'
  },
  rightGridContainer:{
    height: '48%',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc0'
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