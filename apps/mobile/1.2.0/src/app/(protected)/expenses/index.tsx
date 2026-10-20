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
import BackButton from '@/components/common/BackButton';
import HiveBg from '@/components/common/HiveBg';
import RadialGauge from '@/components/ui/RadialGauge';

export default function BudgetScreen() {
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
        style={{ flexGrow: 1 }} 
        contentContainerStyle={{ height: 2000 }} 
        headerAppearOn={60}
        title={"My Budget"}
        subtitle={'@'+session?.user?.username}
      >
        <BackButton/>

        

        <View style={styles.header}>
          <RadialGauge 
            maximum={3000} 
            value={1000}
            radius={110}
            width={10}
            style={styles.gauge}
          />

          <View style={styles.centerText}>
            <TText type='title'>1000000.00</TText>
            <TText>My Monthly Expenses Limit</TText>
          </View>

          {/* <View style={styles.headerTabContainer}>
            <TouchableOpacity style={styles.headerTab}>

            </TouchableOpacity>
          </View> */}
          
        </View>

        <TView color='primary' style={styles.content}>

        </TView>

        
      </StickyScrollView>
    </TView>
    
  );
}

const styles = StyleSheet.create({
  header:{
  },
  gauge:{
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  centerText:{
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50
  },
  editLimit:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  content:{
    padding: '3%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#ccc2",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50
  }
});