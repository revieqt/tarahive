import { TText, TView } from '@/components/ui/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
// import { useAuthLogin } from '@/context/SessionContext';
import DatePickerField from '@/components/ui/DatePickerField';
// import { useUser } from '@/hooks/useUser';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import HiveBg from '@/components/common/HiveBg';
import Header from '@/components/common/Header';

export default function RequestLogsScreen() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // const { requestUserLogs, isLoading, error } = useUser();
  const router = useRouter();

//   const handleRequestLogs = async () => {
//     try {
//       if (!startDate || !endDate) {
//         Alert.alert('Error', 'Please select both start and end dates');
//         return;
//       }
//       const startDateStr = startDate.toISOString().split('T')[0];
//       const endDateStr = endDate.toISOString().split('T')[0];
//       await requestUserLogs(startDateStr, endDateStr);
//       Alert.alert('Success', 'Log request submitted successfully');
//       router.back();

//     } catch (err) {
//       Alert.alert('Error', error || 'Failed to request logs');
//     }
//   };

  return (
    <TView style={styles.container} color='primary'>
      
        <HiveBg/>
        <Header title="Request Activity Logs" subtitle="Select a date range to request your activity logs." />  

        <DatePickerField
            placeholder="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
        <DatePickerField
            placeholder="End Date"
            value={endDate}
            onChange={setEndDate}
          />
      <Button
        title="Request Logs"
        buttonStyle={styles.requestButton}
        onPress={() => []}
        type="primary"
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  requestButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16
  }

});