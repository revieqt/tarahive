import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View} from 'react-native';
import { TText, TIcon } from '@/shared/components/ui/Themed';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import SOSSection from './sos';
import SafetySettingsSection from './settings';

export default function SafetyScreen() {
  const iconColor = useThemeColor({}, 'icon');
  const secondaryColor = useThemeColor({}, 'accent');
  const backgroundColor = useThemeColor({}, 'primary');
  const [selectedTab, setSelectedTab] = useState('sos');

  return (
    <>
      <View style={selectedTab === 'sos' ? {flex: 1} : {flex: 0, overflow: 'hidden'}}>
        <SOSSection />
      </View>
      <View style={selectedTab === 'settings' ? {flex: 1} : {flex: 0}}>
        <SafetySettingsSection />
      </View>
      <View style={[styles.tabBar, {backgroundColor}]}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab('sos')}>
          <TIcon
            name={selectedTab === 'sos' ? 'alert-circle' : 'alert-circle-outline'}
            size={20}
            color={selectedTab === 'sos' ? secondaryColor : iconColor}
          />
          <TText style={[styles.tabButtonText, {color: selectedTab === 'sos' ? secondaryColor : iconColor}]}>
            SOS
          </TText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab('settings')}>
          <TIcon
            name={selectedTab === 'settings' ? 'cog' : 'cog-outline'}
            size={20}
            color={selectedTab === 'settings' ? secondaryColor : iconColor}
          />
          <TText style={[styles.tabButtonText, {color: selectedTab === 'settings' ? secondaryColor : iconColor}]}>
            Settings
          </TText>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar:{
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  tabButton:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabButtonText:{
    fontSize: 11,
    marginTop: 2,
    opacity: .7,
    textAlign: 'center',
  }
});