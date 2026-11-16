import { TText, TView, TIcon } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { useTara } from '@/hooks/shared/useTara';
import SidebarAlerts from '@/components/common/Sidebar';
import MonthlyCalendar from '@/components/cards/MonthlyCalendarCard';
import { StickyScrollViewHeader } from '@/components/ui/StickyScrollView';
import { useAiChat } from '@/hooks/tara/useAiChat';
import Wave from '@/components/ui/Wave';
import HiveBg from '@/components/common/HiveBg';
import CommonImage from '@/components/common/CommonImage';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const [searchAi, setSearchAi] = useState('');
  const [animatedSuggestion, setAnimatedSuggestion] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const suggestion = useTara('suggestions');
  const { t } = useLanguage();
  const locationData = useLocation();
  const currentCity = locationData.city || locationData.suburb || locationData.region || locationData.state || 'Your Location';
  const { clearChat } = useAiChat();

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
    clearChat();
    router.push({
      pathname: '/tara',
      params: { prompt, triggerSearch: 'true' },
    } as any);
  };
  const searchPrompt = searchAi.trim() || suggestion.trim();

  const menuButtons = [
    {
      title: t('home.menu_itinerary'),
      description: 'Planner',
      icon: require('../../../../assets/images/itinerary-icon.png'),
      onPress: () => router.push('/itinerary'),
    },
    {
      title: t('home.menu_expenses'),
      description: t('home.menu_expenses_desc'),
      icon: require('../../../../assets/images/budget-icon.png'),
      onPress: () => router.push('/expenses'),
    },
    {
      title: t('home.menu_sos'),
      description: 'Emergency',
      icon: require('../../../../assets/images/sos-icon.png'),
      onPress: () => router.push('/sos'),
    },
    {
      title: 'Tara',
      description: 'AI Assistant',
      icon: require('../../../../assets/images/icon.png'),
      onPress: () => router.push('/tara'),
    },
  ];

  return (
    <TView style={{ flex: 1 }} color='primary'>
      <LinearGradient colors={[accentColor, secondaryColor]} style={styles.headerBg}>
        <CommonImage searchQuery={currentCity} style={styles.headerBgImage} overlay={{backgroundColor: "#0005"}}/>
        <HiveBg fade={false}/>
      </LinearGradient>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TText style={{ color: '#fff', opacity: .8}}>Good Morning, Joshua! You're in</TText>
          <TText type='title' style={{ color: '#fff',lineHeight: 20, letterSpacing: 1 }}>
            {currentCity}
          </TText>
    
          <TouchableOpacity
            style={styles.weatherButton}
            onPress={() => router.push('/place')}
          >
            <TText style={{ color: '#fff', opacity: .8, fontSize: 12}}>View Weather</TText>
          </TouchableOpacity>
        </View>
        <Wave amplitude={20} height={40}/>
        <TView style={styles.menuContainer} color='primary'>
          <View style={styles.searchContainer}>
            <View style={[styles.searchFieldContainer, { backgroundColor }]}>
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
            </View>


            <TouchableOpacity
              style={[styles.qrButton, { backgroundColor }]}
              onPress={() => router.push('/scan')}
            >
              <TIcon name='qrcode-scan' size={17}/>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuButtonsContainer}>
            {menuButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={button.onPress}
                style={[styles.menuButton, { backgroundColor }]}
              >
                <Image source={button.icon} style={styles.menuButtonImage} />
                <TText style={styles.menuButtonText}>{button.title}</TText>
                <TText style={styles.menuButtonDescription}>{button.description}</TText>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    paddingBottom: 60,
  },
  headerBg: {
    width: '100%',
    padding: 16,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 200,
    alignItems: 'center'
  },
  headerBgImage:{
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: -2,
    right: -2,
    zIndex: 10,
  },
  header:{
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingTop: 40,
    paddingBottom: 10
  },
  weatherButton:{
    borderWidth: 1,
    borderColor: "#fff5",
    backgroundColor: "#fff3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    gap: 4,
    marginTop: 5,
    borderRadius: 20
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
    borderColor: '#ccc2'
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
    borderColor: '#ccc2'
  },
  menuButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: '3%',
    paddingTop: 12,
    marginBottom: 14,
    zIndex: 100,
    gap: 6
  },
  menuButton: {
    width: 100,
    height: 100,
    borderRadius: 25,
    paddingTop: 52,
    alignItems: 'center',
    gap: 3
  },
  menuButtonImage: {
    width: 65,
    height: 65,
    position: 'absolute',
    top: -15,
    left: 18,
    opacity: 0.8
  },
  menuButtonText: {
    fontWeight: 600,
    opacity: 0.8,
  },
  menuButtonDescription: {
    fontSize: 11,
    opacity: 0.5,
  },
});