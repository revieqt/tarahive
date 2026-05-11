import { Link, Stack } from 'expo-router';
import { StyleSheet, } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <TView style={styles.container}>
        <TIcon name="emoticon-sad" size={50}/>
        <TText type="title">This screen doesn't exist.</TText>
        <Link href="/">
          <TText>Go back to home screen!</TText>
        </Link>
      </TView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10
  },
});
