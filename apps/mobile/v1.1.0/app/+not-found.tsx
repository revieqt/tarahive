import { router, Stack } from 'expo-router';
import { StyleSheet, } from 'react-native';
import { TIcon, TText, TView } from '@/shared/components/ui/Themed';
import HiveBg from '@/shared/components/common/HiveBg';
import Button from '@/shared/components/ui/Button';
import EmptyMessage from '@/shared/components/common/EmptyMessage';

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
        {/* <TIcon name="emoticon-sad" size={50}/>
        <TText type="title" style={{marginTop: 10}}>This screen doesn't exist.</TText>
        <Button
          title='Go Back'
          onPress={handleGoBack}
        /> */}
        <EmptyMessage
          iconName="emoticon-sad"
          title="This screen doesn't exist."
          buttonLabel="Go Back"
          buttonAction={handleGoBack}
          description="The page you are looking for might have been removed or is temporarily unavailable."
          isSolid
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
