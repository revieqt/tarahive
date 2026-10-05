import { TText, TView, TIcon } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import HomeHeaderCard from '@/components/cards/HomeHeaderCard';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { useSession } from '@/context/SessionContext';

export default function RoomsScreen() {
  const isConnected = useInternetConnection();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');
  const { t } = useLanguage();
  const { session } = useSession();

  return (
    <StickyScrollView 
      style={{ flex: 1 }} 
      contentContainerStyle={{ height: 2000 }} 
      showBackButton={false}
      title={"Rooms"}
      subtitle={'@'+session?.user?.username}
    >
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <TText type='title'>Rooms</TText>
          <TText>Rooms dasdasdasda sdasdasdas dasd asdasdasd</TText>
        </View>

        <TouchableOpacity onPress={() => router.push('/room/create')} style={styles.createButton}>
          <TIcon name='plus' size={30} color={accentColor}/>
        </TouchableOpacity>
      </View>

      {/* <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{height: 2000}}
        showsVerticalScrollIndicator={false}
      >
        <TView style={{flexGrow: 1}}>
          <View style={[styles.gridContainer, { backgroundColor: primaryColor }]}>
            <TouchableOpacity
              onPress={() => router.push('/room/create')}
              style={styles.gridChildContainer}
            >
              <TIcon name='account-multiple-plus' size={20} style={styles.gridIcon} color={accentColor}/>
              <TText>Create</TText>
              <TText style={{ opacity: .5, fontSize: 10 }}>Rooms</TText>
            </TouchableOpacity>

            <View style={styles.divider}/>

            <TouchableOpacity
              onPress={() => router.push('/room/join')}
              style={styles.gridChildContainer}
            >
              <TIcon name='account-group' size={20} style={styles.gridIcon} color={accentColor}/>
              <TText>Join</TText>
              <TText style={{ opacity: .5, fontSize: 10 }}>Rooms</TText>
            </TouchableOpacity>

            <View style={styles.divider}/>

            <TouchableOpacity
              onPress={() => router.push('/room/search')}
              style={styles.gridChildContainer}
            >
              <TIcon name='account-search' size={20} style={styles.gridIcon} color={accentColor}/>
              <TText>Search</TText>
              <TText style={{ opacity: .5, fontSize: 10 }}>Rooms</TText>
            </TouchableOpacity>
          </View>
        </TView>
      </ScrollView> */}
    </StickyScrollView>
  );
}

const styles = StyleSheet.create({
  header:{
    height: 100,
    paddingHorizontal: '3%',
    flexDirection: 'row',
  },
  createButton: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});