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
import SpeedDial from '@/components/ui/SpeedDial';

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
    <TView style={{flex: 1}}>
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
        </View>

        
      </StickyScrollView>

      <SpeedDial
        icon="plus"
        closeIcon="close"
        fabColor="#FF6B6B"
        style={styles.dialButton}
        actions={[
          {
            key: 'search',
            label: 'Search Rooms',
            icon: 'account-supervisor-circle-outline',
            onPress: () => router.push('/room/create'),
          },
          {
            key: 'join',
            label: 'Join Room',
            icon: 'account-star',
            onPress: () => router.push('/room/join'),
          },
          {
            key: 'create',
            label: 'Create New Room',
            icon: 'account-multiple-plus',
            onPress: () => router.push('/room/create'),
          },
        ]}
      />
    </TView>
    
  );
}

const styles = StyleSheet.create({
  header:{
    height: 100,
    paddingHorizontal: '3%',
    flexDirection: 'row',
  },
  dialButton:{
    position: 'absolute',
    bottom: 75,
    right: 8
  }
});