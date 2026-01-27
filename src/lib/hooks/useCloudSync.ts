import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useWellnessStore } from "@/lib/store";
import { updateProfile, getProfile, syncProgress, Profile } from "@/lib/api/profile";

/**
 * Hook to sync local wellness data with Supabase cloud
 * - On login: Downloads cloud profile and merges with local
 * - On app activity: Uploads local progress to cloud
 */
export function useCloudSync() {
    const { user, loading } = useAuth();
    const lastSyncRef = useRef<number>(0);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Local store getters
    const userName = useWellnessStore((s) => s.userName);
    const userAvatar = useWellnessStore((s) => s.userAvatar);
    const plantLevel = useWellnessStore((s) => s.plantLevel);
    const plantPoints = useWellnessStore((s) => s.plantPoints);
    const currentStreak = useWellnessStore((s) => s.currentStreak);
    const longestStreak = useWellnessStore((s) => s.longestStreak);
    const dailyHistory = useWellnessStore((s) => s.dailyHistory);
    const userAgeRange = useWellnessStore((s) => s.userAgeRange);
    const userWellnessFocus = useWellnessStore((s) => s.userWellnessFocus);

    // Local store setters
    const setUserName = useWellnessStore((s) => s.setUserName);
    const setUserAvatar = useWellnessStore((s) => s.setUserAvatar);
    const setUserAgeRange = useWellnessStore((s) => s.setUserAgeRange);
    const setUserWellnessFocus = useWellnessStore((s) => s.setUserWellnessFocus);

    // Get today's progress
    const getTodayProgress = () => {
        const today = new Date().toISOString().split("T")[0];
        const todayEntry = dailyHistory.find((d) => d.date === today);
        return {
            pointsToday: todayEntry?.pointsEarned || 0,
            goalsCompletedToday: todayEntry?.goalsCompleted || 0,
            totalGoalsToday: todayEntry?.totalGoals || 4,
        };
    };

    // Download profile from cloud and merge with local
    const pullFromCloud = async () => {
        if (!user) return;

        try {
            const cloudProfile = await getProfile();
            if (cloudProfile) {
                // Use cloud name if local is empty
                if (!userName && cloudProfile.name) {
                    setUserName(cloudProfile.name);
                }
                // Use cloud avatar if different default
                if (cloudProfile.avatar_url && cloudProfile.avatar_url !== userAvatar) {
                    setUserAvatar(cloudProfile.avatar_url);
                }
                // Sync age range and wellness focus
                if (cloudProfile.age_range && !userAgeRange) {
                    setUserAgeRange(cloudProfile.age_range);
                }
                if (cloudProfile.wellness_focus && !userWellnessFocus) {
                    setUserWellnessFocus(cloudProfile.wellness_focus);
                }
            }
        } catch (error) {
            console.error("Error pulling from cloud:", error);
        }
    };

    // Push local data to cloud
    const pushToCloud = async () => {
        if (!user) return;

        const now = Date.now();
        // Throttle syncs to once per 30 seconds
        if (now - lastSyncRef.current < 30000) return;
        lastSyncRef.current = now;

        try {
            // Update profile
            await updateProfile({
                name: userName,
                avatar_url: userAvatar,
                age_range: userAgeRange,
                wellness_focus: userWellnessFocus,
            });

            // Sync daily progress
            const { pointsToday, goalsCompletedToday, totalGoalsToday } = getTodayProgress();
            await syncProgress(
                plantLevel,
                plantPoints,
                currentStreak,
                longestStreak,
                pointsToday,
                goalsCompletedToday,
                totalGoalsToday
            );
        } catch (error) {
            console.error("Error pushing to cloud:", error);
        }
    };

    // Initial sync on auth change
    useEffect(() => {
        if (loading) return;

        if (user) {
            // User just logged in - pull cloud data then push local
            pullFromCloud().then(() => pushToCloud());

            // Set up periodic sync every 2 minutes
            syncIntervalRef.current = setInterval(pushToCloud, 120000) as any;
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [user, loading]);

    // Sync when key data changes
    useEffect(() => {
        if (user && !loading) {
            pushToCloud();
        }
    }, [plantLevel, plantPoints, currentStreak]);

    return {
        isAuthenticated: !!user,
        syncNow: pushToCloud,
    };
}
