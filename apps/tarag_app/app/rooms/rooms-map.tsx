import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, FlatList, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedIcons } from '@/components/ThemedIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Wave from '@/components/Wave';
import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { CustomAlert } from '@/components/Alert';
import ItineraryPickerModal from '@/components/modals/ItineraryPickerModal';
import UserPickerModal from '@/components/modals/UserPickerModal';
import { router } from 'expo-router';

export default function RoomMapScreen() {
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');


  return (
    <ThemedView style={{ flex: 1 }} color="secondary">
      <BackButton type='floating' color="white"/>
      <View style={styles.bottomContent}>
        <Wave
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0}}
          color={primaryColor}
          height={100}
        />
        <View style={styles.shareLocationContainer}>
          <TouchableOpacity style={styles.shareLocationButton} activeOpacity={.7}>
            <ThemedIcons name="play" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText type='subtitle'>Share Location for 1 Hour</ThemedText>
        </View>
        
      </View>
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  bottomContent:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 200,
  },
  shareLocationButton: {
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareLocationContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  }
});