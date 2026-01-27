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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        await supabase
            .from("push_tokens")
            .delete()
            .eq("user_id", user.id)
            .eq("token", tokenData.data);
    } catch (error) {
        console.log("Error unregistering push token:", error);
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
