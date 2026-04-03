import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import {ThemedIcons} from '@/components/ThemedIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import SOSSection from './sos';
import NearbyHelpSection from './nearbyHelp';

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
      <View style={selectedTab === 'nearbyHelp' ? {flex: 1} : {flex: 0}}>
        <NearbyHelpSection />
      </View>
      <View style={[styles.tabBar, {backgroundColor}]}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab('sos')}>
          <ThemedIcons
            name={selectedTab === 'sos' ? 'alert-circle' : 'alert-circle-outline'}
            size={20}
            color={selectedTab === 'sos' ? secondaryColor : iconColor}
          />
          <ThemedText style={[styles.tabButtonText, {color: selectedTab === 'sos' ? secondaryColor : iconColor}]}>
            SOS
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab('nearbyHelp')}>
          <ThemedIcons
            name={selectedTab === 'nearbyHelp' ? 'alarm-light' : 'alarm-light-outline'} 
            size={20}
            color={selectedTab === 'nearbyHelp' ? secondaryColor : iconColor}
          />
          <ThemedText style={[styles.tabButtonText, {color: selectedTab === 'nearbyHelp' ? secondaryColor : iconColor}]}>
            Nearby Help
          </ThemedText>
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