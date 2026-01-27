import React from "react";
import { Onboarding } from "@/components/Onboarding";
import { useWellnessStore } from "@/lib/store";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasCompletedOnboarding = useWellnessStore(
    (s) => s.setHasCompletedOnboarding
  );

  const handleComplete = () => {
    setHasCompletedOnboarding(true);
    router.replace("/(tabs)");
  };

  return <Onboarding onComplete={handleComplete} />;
}
