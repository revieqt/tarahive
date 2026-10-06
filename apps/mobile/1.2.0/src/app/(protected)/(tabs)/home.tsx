import { TText, TView, TIcon } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import HomeHeaderCard from '@/components/cards/HomeHeaderCard';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTara } from '@/hooks/shared/useTara';
import SidebarAlerts from '@/components/common/Sidebar';
import MonthlyCalendar from '@/components/cards/MonthlyCalendarCard';

export default function HomeScreen() {
  const isConnected = useInternetConnection();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');
  const [searchAi, setSearchAi] = useState('');
  const [animatedSuggestion, setAnimatedSuggestion] = useState('');
  const suggestion = useTara('suggestions');
  const { t } = useLanguage();

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
  return (
    <TView style={{ flex: 1 }}>
      <HomeHeaderCard />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          <LinearGradient colors={['transparent', backgroundColor, backgroundColor]} style={styles.menuGradient} />
          <View style={styles.searchContainer}>
            <View style={[styles.searchFieldContainer, styles.shadow, { backgroundColor: primaryColor }]}>
              <TextInput
                value={searchAi}
                onChangeText={setSearchAi}
                placeholder={animatedSuggestion}
                autoCapitalize="words"
                style={[styles.searchField, { color: textColor }]}
              />

              <TouchableOpacity
               onPress={() => router.push({
                  pathname: '/tara',
                  params: { prompt: searchAi, triggerSearch: true },
                } as any)}
              >
                <TIcon name='send' size={18} color={searchAi ? secondaryColor : '#ccc4'} />
              </TouchableOpacity>
            </View>


            <TouchableOpacity
              style={[styles.qrButton, styles.shadow, { backgroundColor: primaryColor }]}
              onPress={() => router.push('/scan')}
            >
              <TIcon name='qrcode-scan' size={20} color={textColor + '90'} />
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            <TouchableOpacity
              onPress={() => router.push('/itinerary')}
              style={[styles.gridChildContainer, styles.leftGridContainer, styles.shadow, { backgroundColor: primaryColor }]}
            >
              <View style={{ padding: 10 }}>
                <TText style={{ opacity: .5, fontSize: 10 }}>{t('tabs.home.menu_itinerary_desc')}</TText>
                <TText style={{ opacity: .8, fontSize: 13, fontFamily: 'PoppinsBold' }}>{t('tabs.home.menu_itinerary')}</TText>
              </View>
              <Image source={require('../../../../assets/images/itinerary-icon.png')} style={styles.leftGridImage} />
            </TouchableOpacity>
            <View
              style={[styles.gridChildContainer, styles.leftGridContainer]}>
              <TouchableOpacity
                onPress={() => router.push('/sos')}
                style={[styles.rightGridContainer, styles.shadow, { backgroundColor: primaryColor }]}
              >
                <TText style={{ opacity: .5, fontSize: 10 }}>{t('tabs.home.menu_sos_desc')}</TText>
                <TText style={{ opacity: .8, fontSize: 12, fontFamily: 'PoppinsBold' }}>{t('tabs.home.menu_sos')}</TText>
                <Image source={require('../../../../assets/images/sos-icon.png')} style={styles.rightGridImage} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/tara')}
                style={[styles.rightGridContainer, styles.shadow, { backgroundColor: primaryColor }]}
              >
                <TText style={{ opacity: .5, fontSize: 10 }}>{t('tabs.home.menu_tara_desc')}</TText>
                <TText style={{ opacity: .8, fontSize: 12, fontFamily: 'PoppinsBold' }}>{t('tabs.home.menu_tara')}</TText>
                <Image source={require('../../../../assets/images/icon.png')} style={styles.rightGridImage} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TView style={styles.content}>
          <MonthlyCalendar/>


        </TView>
        
      </ScrollView>

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
  },
  menuContainer: {
    position: 'relative',
    zIndex: 100,
    paddingBottom: '3%'
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: '3%',
    marginBottom: '2%',
    zIndex: 1000,
  },
  searchFieldContainer: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    overflow: 'hidden'
  },
  searchField: {
    fontFamily: 'Inter',
    fontSize: 11,
    paddingHorizontal: 12,
    flex: 1,
  },
  qrButton: {
    height: 40,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#ccc7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  menuGradient: {
    height: '105%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
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
    borderColor: '#ccc0'
  },
  rightGridContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc0',
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
    opacity: .8,
  },
  content:{
    marginBottom: 20
  },
});