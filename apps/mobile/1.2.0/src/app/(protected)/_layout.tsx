import { Stack } from 'expo-router';
import { CopilotProvider } from 'react-native-copilot';

export default function ProtectedLayout() {
  return (
    <CopilotProvider>
        <Stack screenOptions={{ headerShown: false }}/>
    </CopilotProvider>
  );
}