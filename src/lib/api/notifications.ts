import { supabase } from "@/lib/supabase";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Register for push notifications and save token
export async function registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
        return null;
    }

    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Add to .env if using EAS
    });
    const token = tokenData.data;

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from("push_tokens").upsert({
            user_id: user.id,
            token,
            platform: Platform.OS,
        }, { onConflict: "user_id,token" });
    }

    // Configure notification handler
    Notifications.setNotificationHandler({
        handleNotification: async (notification) => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
    });

    return token;
}

// Remove push token on logout
export async function unregisterPushNotifications() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        });
        await supabase
            .from("push_tokens")
            .delete()
            .eq("user_id", user.id)
            .eq("token", tokenData.data);
    } catch (error) {
        // Don't let push token errors block sign out
        console.log("Error unregistering push token (non-blocking):", error);
    }
}

// Schedule local notification (for testing)
export async function sendLocalNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: null, // Show immediately
    });
}

// Send a push notification to a specific user
export async function sendPushNotification(userId: string, title: string, body: string) {
    try {
        // 1. Get user's push token
        const { data: tokens, error } = await supabase
            .from("push_tokens")
            .select("token")
            .eq("user_id", userId);

        if (error || !tokens || tokens.length === 0) {
            return;
        }

        // 2. Send notification via Expo
        // We send to all tokens registered for this user (e.g. iPad and iPhone)
        const messages = tokens.map((t: { token: string }) => ({
            to: t.token,
            sound: "default",
            title,
            body,
            data: { url: "alma://garden" }, // Deep link to garden
        }));

        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messages),
        });

    } catch (error) {
        console.error("Error sending push notification:", error);
    }
}
