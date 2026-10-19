import { TText, TView, TIcon } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import HomeHeaderCard from '@/components/cards/HomeHeaderCard';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { useTara } from '@/hooks/shared/useTara';
import SidebarAlerts from '@/components/common/Sidebar';
import MonthlyCalendar from '@/components/cards/MonthlyCalendarCard';
import { StickyScrollViewHeader } from '@/components/ui/StickyScrollView';
import BetaTesterCard from '@/components/cards/BetaTesterCard';

export default function HomeScreen() {
  const isConnected = useInternetConnection();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');
  const [searchAi, setSearchAi] = useState('');
  const [animatedSuggestion, setAnimatedSuggestion] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const suggestion = useTara('suggestions');
  const { t } = useLanguage();
  const locationData = useLocation();
  const currentCity = locationData.city || locationData.suburb || locationData.region || locationData.state || 'Your Location';

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  useEffect(() => {
    setAnimatedSuggestion('');
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      currentIndex += 1;
      setAnimatedSuggestion(suggestion.slice(0, currentIndex));
      if (currentIndex >= suggestion.length) clearInterval(typingInterval);
    }, 20);

    return () => clearInterval(typingInterval);
  }, [suggestion]);

  const handleSearchSend = () => {
    const prompt = searchAi.trim() || suggestion.trim();
    if (!prompt) return;

    router.push({
      pathname: '/tara',
      params: { prompt, triggerSearch: 'true' },
    } as any);
  };
  const searchPrompt = searchAi.trim() || suggestion.trim();

  return (
    <TView style={{ flex: 1 }}>
      <HomeHeaderCard />
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuContainer}>
          <LinearGradient colors={['transparent', backgroundColor, backgroundColor]} style={styles.menuGradient} />
          <View style={styles.searchContainer}>
            <View style={[styles.searchFieldContainer, { borderColor: primaryColor }]}>
              <TextInput
                value={searchAi}
                onChangeText={setSearchAi}
                placeholder={animatedSuggestion}
                autoCapitalize="words"
                style={[styles.searchField, { color: textColor }]}
              />

              <TouchableOpacity onPress={handleSearchSend} disabled={!searchPrompt}>
                <TIcon name='send' size={15} color={searchPrompt ? accentColor + '95' : '#ccc4'} />
              </TouchableOpacity>
              <View style={[styles.translucentBg, { backgroundColor: primaryColor }]}/>
            </View>


            <TouchableOpacity
              style={[styles.qrButton, { borderColor: primaryColor }]}
              onPress={() => router.push('/scan')}
            >
              <TIcon name='qrcode-scan' size={17}/>
              <View style={[styles.translucentBg, { backgroundColor: primaryColor }]}/>
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            <TouchableOpacity
              onPress={() => router.push('/itinerary')}
              style={[styles.gridChildContainer, styles.leftGridContainer, { backgroundColor: primaryColor, borderWidth: 1, borderColor: "#ccc2" }]}
            >
              <View style={{ padding: 12 }}>
                <TText style={{ opacity: .8, fontSize: 12, fontFamily: 'PlusJakartaSans', color: accentColor, fontWeight: 800 }}>{t('tabs.home.menu_itinerary')}</TText>
                <TText style={{ opacity: .5, fontSize: 10 }}>Travel Planner</TText>
              </View>
              <Image source={require('../../../../assets/images/itinerary-icon.png')} style={styles.leftGridImage} />
            </TouchableOpacity>
            <View
              style={[styles.gridChildContainer, styles.leftGridContainer]}>
              <TouchableOpacity
                onPress={() => router.push('/sos')}
                style={[styles.rightGridContainer, { backgroundColor: primaryColor }]}
              >
                <TText style={{ opacity: .8, fontSize: 11, fontFamily: 'PlusJakartaSans', color: accentColor, fontWeight: 800 }}>{t('tabs.home.menu_sos')}</TText>
                <TText style={{ opacity: .5, fontSize: 10 }}>Emergency Alert</TText>
                <Image source={require('../../../../assets/images/sos-icon.png')} style={styles.rightGridImage} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/expenses')}
                style={[styles.rightGridContainer, { backgroundColor: primaryColor }]}
              >
                <TText style={{ opacity: .8, fontSize: 11, fontFamily: 'PlusJakartaSans', color: accentColor, fontWeight: 800 }}>Expenses</TText>
                <TText style={{ opacity: .5, fontSize: 10 }}>Tracker</TText>
                <Image source={require('../../../../assets/images/budget-icon.png')} style={styles.rightGridImage} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TView style={styles.content}>
          <MonthlyCalendar/>
        </TView>
      </Animated.ScrollView>
      <StickyScrollViewHeader
        title={currentCity}
        subtitle='Your current location'
        showBackButton={false}
        onTitlePress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        headerAppearOn={180}
        scrollY={scrollY}
      />
      <SidebarAlerts />
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
    paddingTop: 175,
    paddingBottom: 60,
  },
  menuContainer: {
    position: 'relative',
    zIndex: 100,
    paddingBottom: '3%'
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: '3%',
    marginBottom: '2%',
    zIndex: 1000,
  },
  searchFieldContainer: {
    flex: 1,
    height: 40,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  searchField: {
    fontFamily: 'PlusJakartaSans',
    fontSize: 11,
    paddingHorizontal: 12,
    flex: 1,
    opacity: .8
  },
  qrButton: {
    height: 40,
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', 
    borderWidth: 1, 
  },
  translucentBg:{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: .4
  },
  menuGradient: {
    height: '120%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '3%',
    zIndex: 100,
    gap: '2%',
  },
  gridChildContainer: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    gap: '5%',
  },
  leftGridContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc0',
  },
  rightGridContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc2',
    padding: 10,
  },
  leftGridImage: {
    width: '85%',
    height: '85%',
    position: 'absolute',
    bottom: '-15%',
    right: '-15%',
    opacity: .9,
  },
  rightGridImage: {
    width: '55%',
    height: '130%',
    position: 'absolute',
    bottom: '-30%',
    right: '-13%',
    opacity: .9,
  },
  content:{
    marginBottom: 20
  },
});