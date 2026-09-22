import { TText, TView, TIcon } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import HomeHeaderCard from '@/components/cards/HomeHeaderCard';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TARA_AI_SUGGESTIONS } from '@/constants/Tara';
import SidebarAlerts from '@/components/common/Sidebar';
import MonthlyCalendar from '@/components/cards/MonthlyCalendarCard';
import HiveBg from '@/components/common/HiveBg';

export default function RoomsScreen() {
  const isConnected = useInternetConnection();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');
  const { t } = useLanguage();

  return (
    <TView style={{ flex: 1 }}>
      <LinearGradient
        colors={[accentColor, secondaryColor]}
        style={styles.header}
      >
        <TText type='title' style={{color: '#fff'}}>Rooms</TText>
        <TText style={{color: '#fff'}}>Rooms dasdasdasda sdasdasdas dasd asdasdasd</TText>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{height: 2000}}
        showsVerticalScrollIndicator={false}
      >
        <TView style={{flexGrow: 1}}>
          <View style={[styles.gridContainer, { backgroundColor: primaryColor }]}>
            <TouchableOpacity
              onPress={() => router.push('/rooms/create')}
              style={styles.gridChildContainer}
            >
              <TIcon name='account-multiple-plus' size={20} style={styles.gridIcon} color={accentColor}/>
              <TText>Create</TText>
              <TText style={{ opacity: .5, fontSize: 10 }}>Rooms</TText>
            </TouchableOpacity>

            <View style={styles.divider}/>

            <TouchableOpacity
              onPress={() => router.push('/rooms/join')}
              style={styles.gridChildContainer}
            >
              <TIcon name='account-group' size={20} style={styles.gridIcon} color={accentColor}/>
              <TText>Join</TText>
              <TText style={{ opacity: .5, fontSize: 10 }}>Rooms</TText>
            </TouchableOpacity>

            <View style={styles.divider}/>

            <TouchableOpacity
              onPress={() => router.push('/rooms/search')}
              style={styles.gridChildContainer}
            >
              <TIcon name='account-search' size={20} style={styles.gridIcon} color={accentColor}/>
              <TText>Search</TText>
              <TText style={{ opacity: .5, fontSize: 10 }}>Rooms</TText>
            </TouchableOpacity>
          </View>
        </TView>
      </ScrollView>
    </TView>
  );
}

const styles = StyleSheet.create({
  header:{
    height: 310,
    paddingTop: 40,
    paddingHorizontal: '3%'
  },
  scrollView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    paddingTop: 120,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 85,
    marginHorizontal: '3%',
    paddingHorizontal: 3,
    zIndex: 100,
    marginTop: -15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  gridChildContainer: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gridIcon:{
    marginBottom: 4
  },
  divider:{
    width: 1,
    height: '50%',
    backgroundColor: '#ccc4'
  }
});