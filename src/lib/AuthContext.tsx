import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, onAuthStateChange, getSession } from "@/lib/supabase";
import { registerForPushNotifications, unregisterPushNotifications } from "@/lib/api/notifications";
import * as Notifications from "expo-notifications";
import { useWellnessStore } from "./store";

const NOTIFICATION_PROMPT_KEY = "@alma_notification_prompt_shown";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    showNotificationPrompt: boolean;
    handleAllowNotifications: () => Promise<void>;
    handleSkipNotifications: () => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
    showNotificationPrompt: false,
    handleAllowNotifications: async () => { },
    handleSkipNotifications: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

    // Check if we should show the notification prompt
    const checkAndShowNotificationPrompt = async () => {
        try {
            // Check if we've already shown the prompt
            const hasShownPrompt = await AsyncStorage.getItem(NOTIFICATION_PROMPT_KEY);
            if (hasShownPrompt) {
                // Already shown, just try to register silently if permission was granted
                registerForPushNotifications();
                return;
            }

            // Check if permission is already granted
            const { status } = await Notifications.getPermissionsAsync();
            if (status === "granted") {
                // Already have permission, register and mark as shown
                registerForPushNotifications();
                await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, "true");
                return;
            }

            // Show our custom prompt
            setShowNotificationPrompt(true);
        } catch (error) {
            console.log("Error checking notification prompt:", error);
        }
    };

    const handleAllowNotifications = async () => {
        setShowNotificationPrompt(false);
        await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, "true");
        await registerForPushNotifications();
    };

    const handleSkipNotifications = () => {
        setShowNotificationPrompt(false);
        AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, "true");
    };

    useEffect(() => {
        // Get initial session
        getSession().then((sess) => {
            setSession(sess);
            setLoading(false);

            // Check for notification prompt if logged in
            if (sess?.user) {
                checkAndShowNotificationPrompt();
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange((event, sess) => {
            setSession(sess);
            setLoading(false);

            // Show notification prompt when user signs in
            if (event === "SIGNED_IN" && sess?.user) {
                // Small delay to let the UI settle after sign-in
                setTimeout(() => {
                    checkAndShowNotificationPrompt();
                }, 1000);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        // Clear local app state (Zustand)
        useWellnessStore.getState().resetAllData();

        await unregisterPushNotifications();
        await supabase.auth.signOut();
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user || null,
                loading,
                signOut: handleSignOut,
                showNotificationPrompt,
                handleAllowNotifications,
                handleSkipNotifications,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
    const { session, loading } = useAuth();
    return { isAuthenticated: !!session, loading };
}

