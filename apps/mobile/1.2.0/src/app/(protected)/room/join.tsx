import { router, Stack } from 'expo-router';
import { StyleSheet, } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import HiveBg from '@/components/common/HiveBg';
import Button from '@/components/ui/Button';
import EmptyMessage from '@/components/common/EmptyMessage';

export default function JoinRoomScreen() {

  const handleGoBack = () => {
    try{
      router.back();
      return;
    }catch{
      router.push('/');
    }
  }

  return (
    <TView style={styles.container}>
      <HiveBg />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
