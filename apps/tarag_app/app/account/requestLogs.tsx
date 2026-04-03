import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';
import Wave from '@/components/Wave';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuthLogin } from '@/context/SessionContext';
import DatePicker from '@/components/DatePicker';
import { useUser } from '@/hooks/useUser';
import Button from '@/components/Button';
import { router } from 'expo-router';

export default function RequestLogsScreen() {
  const accentColor = useThemeColor({}, 'accent');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { requestUserLogs, isLoading, error } = useUser();
  const router = useRouter();

  const handleRequestLogs = async () => {
    try {
      if (!startDate || !endDate) {
        Alert.alert('Error', 'Please select both start and end dates');
        return;
      }
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      await requestUserLogs(startDateStr, endDateStr);
      Alert.alert('Success', 'Log request submitted successfully');
      router.back();

    } catch (err) {
      Alert.alert('Error', error || 'Failed to request logs');
    }
  };

  return (
    <ThemedView style={{flex: 1}} color='primary'>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type='title'>
          Request Logs
        </ThemedText>
        <ThemedText style={{ marginBottom: 20 }}>
          Enter the details for your log request.
        </ThemedText>

        <View>
          <ThemedText style={{opacity: .7}}>
            Select Start Date
          </ThemedText>
          <DatePicker
            placeholder="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
        </View>

        <View>
          <ThemedText style={{opacity: .7}}>
            Select End Date
          </ThemedText>
          <DatePicker
            placeholder="End Date"
            value={endDate}
            onChange={setEndDate}
          />
        </View>

        
      </KeyboardAvoidingView>
      <Button
        title="Request Logs"
        buttonStyle={styles.requestButton}
        onPress={handleRequestLogs}
        type="primary"
        loading={isLoading}
        disabled={isLoading}
      />
      <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  requestButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16
  }

});