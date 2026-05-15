import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import { useSession } from '@/features/auth/context/SessionContext';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View, Animated, Image } from 'react-native';
import { useEffect,  useRef, useState } from 'react';
import { TARA_MESSAGES } from '@/shared/constants/Tara';
import { useInternetConnection } from '@/shared/utils/checkInternetConnection';
import WeatherCard from '@/shared/components/cards/WeatherCard';

export default function HomeScreen() {
  const { session } = useSession();
  const isConnected = useInternetConnection();
  const user = session?.user;
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');
  const floatAnimation = useRef(new Animated.Value(0)).current;
  
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  // Function to get random message
  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * TARA_MESSAGES.length);
    return TARA_MESSAGES[randomIndex];
  };

  const showMessageBubble = () => {
    const message = getRandomMessage();
    setDisplayedMessage(message);
    setShowBubble(true);

    // Fade in
    Animated.timing(bubbleOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 5 seconds
    setTimeout(() => {
      Animated.timing(bubbleOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowBubble(false);
        setDisplayedMessage('');
      });
    }, 5000);
  };

  // Function to handle Tara image tap
  const handleTaraPress = () => {
    if (showBubble) {
      // If bubble is already showing, hide it and show new message
      Animated.timing(bubbleOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => showMessageBubble(), 100);
      });
    } else {
      showMessageBubble();
    }
  };

  useEffect(() => {
    const startFloatingAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startFloatingAnimation();
  }, [floatAnimation]);

  // Show initial message bubble when screen first appears
  useEffect(() => {
    const timer = setTimeout(() => {
      showMessageBubble();
    }, 1000); // Show after 1 second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <TView style={{ flex: 1 }}>
      <View style={styles.mapHeaderContainer}>
        {/* <HomeMap /> */}
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerContent,{backgroundColor}]}>
          <View style={styles.textContainer}>
            <TText type='title' style={{color: accentColor}}>
              Hello {user?.fname ? `${user.fname}` : ''}!
            </TText>
            <TText style={{opacity: 0.7, fontSize: 14}}>Welcome to TaraG!</TText>
          </View>

          <View style={styles.taraContainer}>
            <TouchableOpacity onPress={handleTaraPress} activeOpacity={1}>
              <Animated.Image 
                source={require('@/shared/assets/images/icon.png')} 
                style={[
                  styles.taraImage,
                  {
                    transform: [
                      {
                        translateY: floatAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                      {
                        rotate: floatAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '-3deg'],
                        }),
                      },
                      
                    ],
                  }
                ]} 
              />
            </TouchableOpacity>
            
            {showBubble && (
              <Animated.View 
                style={[
                  styles.messageBubble,
                  {
                    opacity: bubbleOpacity,
                    transform: [
                      {
                        translateY: floatAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
                    backgroundColor: primaryColor,
                  }
                ]}
              >
                <TText style={styles.bubbleText}>
                  {displayedMessage}
                </TText>
              </Animated.View>
            )}
          </View>
          <LinearGradient
            colors={['transparent', backgroundColor]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.menuGradient}
            pointerEvents="none"
          />
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={[styles.menuOptions, {backgroundColor: secondaryColor}]} onPress={() => router.push('/routes/routes')}>
            <TIcon name="map-marker-radius" size={25} color='#fff'/>
            <TText style={styles.menuOptionText}>Routes</TText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuOptions, {backgroundColor: secondaryColor}]} onPress={() => router.push('/itineraries/itineraries')}>
            <TIcon name="calendar" size={25} color='#fff'/>
            <TText style={styles.menuOptionText}>Itineraries</TText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuOptions, {backgroundColor: secondaryColor}]} onPress={() => router.push('/safety/safety')}>
            <TIcon name="shield-plus" size={25} color='#fff'/>
            <TText style={styles.menuOptionText}>Safety</TText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuOptions, !isConnected && {opacity:.5},{backgroundColor: secondaryColor}]} onPress={() => router.push('/camera/qr-scan')}
            disabled={!isConnected}>
            <TIcon name="qrcode-scan" size={25} color='#fff'/>
            <TText style={styles.menuOptionText}>Scan QR</TText>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
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
                colors={['rgba(0, 255, 222,.4)', 'transparent']}
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
                  colors={['rgba(0, 255, 222,.45)', 'transparent']}
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
                  colors={['rgba(0, 255, 222,.45)', 'transparent']}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.rightGridCircle}
                  pointerEvents="none"
                />
                <Image source={require('@/shared/assets/images/slide3-img.png')} style={styles.rightGridImage} />
              </TouchableOpacity>
            </TView>
          </View>
        </View>

        <View style={{paddingHorizontal: 16, marginBottom: 20}}>
          <WeatherCard />
        </View>
        
        {/* {!user?.isProUser && isConnected && 
          <View style={styles.adContainer}>
            <Banner />
          </View>
        } */}
      </ScrollView>
      {/* <SidebarAlerts /> */}
    </TView>
  );
}

const styles = StyleSheet.create({
  mapHeaderContainer: {
    height: 200,
    backgroundColor: 'blue',
  },
  scrollView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    paddingTop: 135,
  },
  taraContainer: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    zIndex: 100,
    width: '100%',
    height: Dimensions.get('window').width * 0.45,
    overflow: 'visible',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  taraImage: {
    position: 'absolute',
    bottom: -80,
    right: '-10%',
    width: '47%',              
    height: 250,        
    resizeMode: 'contain',
    opacity: 1,
    alignSelf: 'flex-end',
  },
  headerContent: {
    height: 50,
  },
  textContainer: {
    position: 'absolute',
    bottom: 10,
    left: 16,
  },
  messageBubble: {
    position: 'absolute',
    bottom: -10,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderTopRightRadius: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100000,
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  bubbleText: {
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  menuGradient: {
    height: 30,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    right: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  menu:{
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    zIndex: 1002
  },
  menuOptionText:{
    fontSize: 10,
    marginTop: 5,
    color: '#fff'
  },
  gridContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
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
  adContainer:{
    width: '100%',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
});