import { router, Stack } from 'expo-router';
import { StyleSheet, } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import HiveBg from '@/components/common/HiveBg';
import Button from '@/components/ui/Button';
import EmptyMessage from '@/components/common/EmptyMessage';
import { SettingsOption } from '../(tabs)/account';
import Header from '@/components/common/Header';

export default function AdminScreen() {

  return (
    <TView style={styles.container}>
      <HiveBg />
      <Header title="Admin Panel" subtitle='Administrator functions'/>
      <SettingsOption icon='account-lock' label="Notifications" onPress={() => router.push('/admin/notifications')}/>
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '3%'
  },
});
