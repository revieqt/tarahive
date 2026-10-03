import { router, Stack } from 'expo-router';
import { StyleSheet, } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import HiveBg from '@/components/common/HiveBg';
import Header from '@/components/common/Header';

export default function NotificationsScreen() {

  return (
    <TView style={styles.container}>
      <HiveBg />
      <Header title="Notifications" subtitle='Administrator functions'/>
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '3%'
  },
});
