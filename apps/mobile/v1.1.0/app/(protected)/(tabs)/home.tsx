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
import SidebarAlerts from '@/shared/components/common/Sidebar';
import MonthlyCalendar from '@/shared/components/common/MonthlyCalendar';

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
          <LinearGradient colors={['transparent', backgroundColor, backgroundColor]} style={styles.menuGradient} />
          <View style={styles.searchContainer}>
            <View style={[styles.searchFieldContainer, styles.shadow, { backgroundColor: primaryColor }]}>
              <TextInput
                value={searchAi}
                onChangeText={setSearchAi}
                autoCapitalize="words"
                style={[styles.searchField, { color: textColor }]}
              />

              <TouchableOpacity
               onPress={() => router.push({
                  pathname: '/tara',
                  params: { prompt: searchAi },
                } as any)}
              >
                <TIcon name='send' size={18} color={searchAi ? secondaryColor : '#ccc4'} />
              </TouchableOpacity>
            </View>


            <TouchableOpacity
              style={[styles.qrButton, styles.shadow, { backgroundColor: primaryColor }]}
              onPress={() => router.push('/camera')}
            >
              <TIcon name='qrcode-scan' size={25} color={textColor + '90'} />
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            <TouchableOpacity
              onPress={() => router.push('/itinerary')}
              style={[styles.gridChildContainer, styles.leftGridContainer, styles.shadow, { backgroundColor: primaryColor }]}
            >
              <View style={{ padding: 12 }}>
                <TText style={{ opacity: .5, fontSize: 10 }}>{t('tabs.home.menu_itinerary_desc')}</TText>
                <TText style={{ opacity: .85, fontSize: 14 }}>{t('tabs.home.menu_itinerary')}</TText>
              </View>

              <LinearGradient
                colors={[accentColor + '60', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.gridCircle}
                pointerEvents="none"
              />
              <Image source={require('@/shared/assets/images/slide2-img.png')} style={styles.leftGridImage} />
            </TouchableOpacity>
            <View
              style={[styles.gridChildContainer, styles.leftGridContainer]}>
              <TouchableOpacity
                onPress={() => router.push('/sos')}
                style={[styles.rightGridContainer, styles.shadow, { backgroundColor: primaryColor }]}
              >
                <TText style={{ opacity: .5, fontSize: 10 }}>{t('tabs.home.menu_sos_desc')}</TText>
                <TText style={{ opacity: .85 }}>{t('tabs.home.menu_sos')}</TText>
                <LinearGradient
                  colors={[accentColor + '60', 'transparent']}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.rightGridCircle}
                  pointerEvents="none"
                />
                <Image source={require('@/shared/assets/images/slide4-img.png')} style={styles.rightGridImage} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/tara')}
                style={[styles.rightGridContainer, styles.shadow, { backgroundColor: primaryColor }]}
              >
                <TText style={{ opacity: .5, fontSize: 10 }}>{t('tabs.home.menu_tara_desc')}</TText>
                <TText style={{ opacity: .85 }}>{t('tabs.home.menu_tara')}</TText>
                <LinearGradient
                  colors={[accentColor + '60', 'transparent']}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.rightGridCircle}
                  pointerEvents="none"
                />
                <Image source={require('@/shared/assets/images/icon.png')} style={styles.rightGridImage} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TView style={styles.content}>
          <MonthlyCalendar/>

          <TouchableOpacity style={[styles.rateContainer, {backgroundColor: primaryColor}]}>
            <TText>{t('tabs.home.rate_title')}</TText>
            <TText style={{fontSize: 10, opacity: .5}}>{t('tabs.home.rate_subtitle')}</TText>
            <View style={{flexDirection: 'row', gap: 3}}>
              <TIcon name='star' size={13} color={accentColor}/>
              <TIcon name='star' size={13} color={accentColor}/>
              <TIcon name='star' size={13} color={accentColor}/>
              <TIcon name='star' size={13} color={accentColor}/>
              <TIcon name='star' size={13} color={accentColor}/>
            </View>
          </TouchableOpacity>
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
    paddingTop: 185,
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
  },
  menuGradient: {
    height: '93%',
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
    padding: 12,
  },
  gridCircle: {
    height: '150%',
    aspectRatio: 1,
    borderRadius: 1000,
    position: 'absolute',
    bottom: '-75%',
    right: '-50%',
  },
  rightGridCircle: {
    height: '170%',
    aspectRatio: 1,
    borderRadius: 1000,
    position: 'absolute',
    bottom: '-60%',
    right: '-20%',
  },
  leftGridImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: '-30%',
    right: '-30%',
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
  },
  rateContainer:{
    marginTop: '3%',
    marginHorizontal: '3%',
    padding: '3%',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    marginBottom: 9,
    paddingRight: 60,
    overflow: 'hidden',
    gap: 1
  },
});