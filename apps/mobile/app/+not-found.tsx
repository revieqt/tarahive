import { router, Stack } from 'expo-router';
import { StyleSheet, } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import HiveBg from '@/components/common/HiveBg';
import Button from '@/components/ui/Button';

export default function NotFoundScreen() {

  const handleGoBack = () => {
    try{
      router.back();
      return;
    }catch{
      router.push('/');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <TView style={styles.container}>
        <HiveBg />
        <TIcon name="emoticon-sad" size={50}/>
        <TText type="title" style={{marginTop: 10}}>This screen doesn't exist.</TText>
        <Button
          title='Go Back'
          onPress={handleGoBack}
        />
      </TView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
