import {Redirect} from "expo-router";
import { useSession } from '@/context/SessionContext';

export default function Index() {
  const { session, loading } = useSession();

  if (loading) {
    return null;
  }

  if (session?.user) {
    return (
      <Redirect href="/(tabs)/home" />
    );
  }else{
    return (
      <Redirect href="/auth/login" />
    );
  }
}