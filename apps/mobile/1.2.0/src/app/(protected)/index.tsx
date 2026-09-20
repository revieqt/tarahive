import { Redirect } from 'expo-router';
import { useSession } from '@/context/SessionContext';

export default function ProtectedIndex() {
  const { session, loading } = useSession();

  if (loading) {
    return null;
  }

  const needsSetup =
    !session?.user?.fname ||
    !session?.user?.lname ||
    !session?.user?.bdate ||
    !session?.user?.gender;

  return (
    <Redirect
      href={needsSetup ? '/(protected)/user/setup' : '/(protected)/(tabs)'}
    />
  );
}
