import React from "react";
import { useRouter } from "expo-router";
import { AuthScreen } from "@/components/AuthScreen";
import { useWellnessStore } from "@/lib/store";

export default function AuthPage() {
    const router = useRouter();
    const hasCompletedOnboarding = useWellnessStore((s) => s.hasCompletedOnboarding);

    const handleAuthSuccess = () => {
        // If user has completed onboarding, go to main app
        // Otherwise, go to onboarding first
        if (hasCompletedOnboarding) {
            router.replace("/(tabs)");
        } else {
            router.replace("/onboarding");
        }
    };

    const handleSkip = () => {
        // Allow users to try the app without signing up
        if (hasCompletedOnboarding) {
            router.replace("/(tabs)");
        } else {
            router.replace("/onboarding");
        }
    };

    return (
        <AuthScreen
            onAuthSuccess={handleAuthSuccess}
            onSkip={handleSkip}
        />
    );
}
