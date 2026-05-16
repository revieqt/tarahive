import { Redirect } from "expo-router";
import { useSession } from "@/context/SessionContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const ONBOARDING_KEY = "ONBOARDING_COMPLETED";

export default function Index() {
  const { session, loading } = useSession();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasOnboarded(value === "true");
      } catch (_) {
        setHasOnboarded(false);
      } finally {
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, []);

  if (loading || !onboardingChecked) return null;

  if (!hasOnboarded) return <Redirect href="/onboarding" />;

  if (session?.user) return <Redirect href="/(tabs)/home" />;

  return <Redirect href="/onboarding" />;
}