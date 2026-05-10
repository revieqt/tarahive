import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedIcon, ThemedText, ThemedView } from '@/components/ui/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedIcon name="emoticon-sad" size={50}/>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/">
          <ThemedText>Go back to home screen!</ThemedText>
        </Link>
      </ThemedView>
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
