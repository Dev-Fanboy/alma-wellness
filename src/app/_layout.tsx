import React, { useEffect, useState, useRef } from "react";
import { View, AppState, AppStateStatus } from "react-native";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/lib/useColorScheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Celebration } from "@/components/Celebration";
import { FeatureTour } from "@/components/FeatureTour";
import { useWellnessStore } from "@/lib/store";
import { initializeNotifications } from "@/lib/notifications";
import { soundManager } from "@/lib/sounds";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { CloudSyncProvider } from "@/lib/CloudSyncProvider";

// NOTE: KeyboardProvider from react-native-keyboard-controller is disabled for Expo Go compatibility
// Re-enable it when using a development build with native modules linked

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function NavigationHandler() {
  const navigationState = useRootNavigationState();

  // Don't use any navigation hooks until navigation is ready
  if (!navigationState?.key) {
    return null;
  }

  return <NavigationHandlerInner />;
}

function NavigationHandlerInner() {
  const router = useRouter();
  const segments = useSegments();
  const hasCompletedOnboarding = useWellnessStore((s) => s.hasCompletedOnboarding);
  const hasSeenTour = useWellnessStore((s) => s.hasSeenTour);
  const setHasSeenTour = useWellnessStore((s) => s.setHasSeenTour);
  const [showTour, setShowTour] = useState(false);

  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Handle navigation based on onboarding state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || loading) return;

    const inAuth = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";
    const inMainApp = segments[0] === "(tabs)";

    // 1. Check Auth FIRST (User must be signed in)
    if (!user) {
      if (!inAuth) {
        router.replace("/auth");
      }
      return;
    }

    // 2. Then Check Onboarding (Signed-in user must have completed onboarding)
    if (!hasCompletedOnboarding) {
      if (!inOnboarding) {
        router.replace("/onboarding");
      }
      return;
    }

    // Handled auth and onboarding checks above

    // Authenticated and onboarded
    if (inAuth || inOnboarding) {
      router.replace("/(tabs)");
      return;
    }

    // Show tour if onboarding is complete but tour hasn't been seen
    if (inMainApp && !hasSeenTour) {
      setShowTour(true);
    }
  }, [hasCompletedOnboarding, hasSeenTour, segments, user, loading, isMounted]);

  if (showTour) {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <FeatureTour
          onComplete={() => {
            setHasSeenTour(true);
            setShowTour(false);
          }}
        />
      </View>
    );
  }

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Wellness state for celebration
  const checkAndResetDaily = useWellnessStore((s) => s.checkAndResetDaily);
  const goals = useWellnessStore((s) => s.goals);
  const plantLevel = useWellnessStore((s) => s.plantLevel);

  const [showCelebration, setShowCelebration] = useState(false);
  const [previousAllComplete, setPreviousAllComplete] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Check if all goals are complete
  const allGoalsComplete = goals.length > 0 && goals.every((g) => g.current >= g.target);

  // Initialize app
  useEffect(() => {
    checkAndResetDaily();
    initializeNotifications();
    soundManager.init(); // Initialize sound manager
    setIsReady(true);
    SplashScreen.hideAsync();

    // Listen for app state changes to trigger daily reset when coming from background
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkAndResetDaily();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Watch for all goals complete OR level up
  useEffect(() => {
    // Trigger on all goals complete
    if (allGoalsComplete && !previousAllComplete && goals.length > 0) {
      setShowCelebration(true);
    }
    setPreviousAllComplete(allGoalsComplete);
  }, [allGoalsComplete, goals.length]);

  useEffect(() => {
    // Trigger on level up
    if (previousLevel !== null && plantLevel > previousLevel) {
      setShowCelebration(true);
    }
    setPreviousLevel(plantLevel);
  }, [plantLevel]);

  if (!isReady) {
    return <View className="flex-1 bg-cream" />;
  }

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fdfbf7" },
        }}
      >
        {/* Main App */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="journal"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="journal-history"
          options={{
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="notification-settings"
          options={{
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="membership"
          options={{
            presentation: "card",
          }}
        />
      </Stack>
      <NavigationHandler />
      <Celebration
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CloudSyncProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </CloudSyncProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
