import { TText, TView } from '@/shared/components/ui/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
// import { useAuthLogin } from '@/context/SessionContext';
import DatePickerField from '@/shared/components/ui/DatePickerField';
// import { useUser } from '@/hooks/useUser';
import Button from '@/shared/components/ui/Button';
import { router } from 'expo-router';
import Header from '@/shared/components/common/Header';
import { useLanguage } from '@/shared/context/LanguageContext';

export default function RequestLogsScreen() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // const { requestUserLogs, isLoading, error } = useUser();
  const router = useRouter();
  const { t } = useLanguage();

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
    <TView style={styles.container}>
        <Header title={t("users.logs.title")} subtitle={t("users.logs.subtitle")} />  

        <DatePickerField
            placeholder={t("users.logs.start_date")}
            value={startDate}
            onChange={setStartDate}
          />
        <DatePickerField
            placeholder={t("users.logs.end_date")}
            value={endDate}
            onChange={setEndDate}
          />
      <Button
        title={t("common.common.continue")}
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