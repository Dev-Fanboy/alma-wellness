import React from "react";
import { useRouter } from "expo-router";
import { AuthScreen } from "@/components/AuthScreen";
import { useWellnessStore } from "@/lib/store";

export default function AuthPage() {
    const router = useRouter();
    const hasCompletedOnboarding = useWellnessStore((s) => s.hasCompletedOnboarding);

    const handleAuthSuccess = () => {
        // After auth, check if onboarding is needed
        if (hasCompletedOnboarding) {
            router.replace("/(tabs)");
        } else {
            router.replace("/onboarding");
        }
    };

    const handleSkip = () => {
        // SKIP NOT ALLOWED: User must sign up.
        // If we want to allow skipping, we'd need an anonymous auth flow.
        // For now, removing skip button logic or keeping it as a "Look around" (but _layout will block)
        // Ideally, we should remove the Skip button from AuthScreen if auth is mandatory.
        // Redirecting to onboarding will just bounce back to auth if no user.
        alert("Please sign up or log in to continue.");
    };

    return (
        <AuthScreen
            onAuthSuccess={handleAuthSuccess}
        />
    );
}
