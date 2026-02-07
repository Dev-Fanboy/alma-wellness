import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useWellnessStore } from "@/lib/store";
import { updateProfile, getProfile, syncProgress, Profile } from "@/lib/api/profile";
import { supabase } from "@/lib/supabase";

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
    // Note: for pushToCloud we use getState() to ensure fresh values, 
    // but we keep these for dependencies array
    const plantLevel = useWellnessStore((s) => s.plantLevel);
    const plantPoints = useWellnessStore((s) => s.plantPoints);
    const currentStreak = useWellnessStore((s) => s.currentStreak);

    // Local store setters
    const setUserName = useWellnessStore((s) => s.setUserName);
    const setUserAvatar = useWellnessStore((s) => s.setUserAvatar);
    const setUserAgeRange = useWellnessStore((s) => s.setUserAgeRange);
    const setUserWellnessFocus = useWellnessStore((s) => s.setUserWellnessFocus);
    const setInviteCode = useWellnessStore((s) => s.setInviteCode);
    const setMembershipStatus = useWellnessStore((s) => s.setMembershipStatus);
    const inviteCode = useWellnessStore((s) => s.inviteCode);
    const userAgeRange = useWellnessStore((s) => s.userAgeRange);
    const userWellnessFocus = useWellnessStore((s) => s.userWellnessFocus);
    const userAvatar = useWellnessStore((s) => s.userAvatar);
    const userName = useWellnessStore((s) => s.userName);

    // Get today's progress
    const getTodayProgress = () => {
        const state = useWellnessStore.getState();
        const today = new Date().toISOString().split("T")[0];
        const todayEntry = state.dailyHistory.find((d) => d.date === today);
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
                // Use cloud avatar ONLY if:
                // 1. Cloud has a valid avatar URL
                // 2. Local avatar is a default Unsplash placeholder OR empty
                // This prevents overwriting user's custom uploaded photos
                const isLocalDefault = !userAvatar || userAvatar.includes("unsplash.com");
                const cloudHasRealAvatar = cloudProfile.avatar_url &&
                    cloudProfile.avatar_url.length > 0 &&
                    !cloudProfile.avatar_url.includes("unsplash.com");

                if (cloudProfile.avatar_url && (isLocalDefault || cloudHasRealAvatar)) {
                    // Only update if cloud has a better avatar (uploaded vs default)
                    if (cloudHasRealAvatar || (isLocalDefault && cloudProfile.avatar_url !== userAvatar)) {
                        setUserAvatar(cloudProfile.avatar_url);
                    }
                }
                // Sync age range and wellness focus
                if (cloudProfile.age_range && !userAgeRange) {
                    setUserAgeRange(cloudProfile.age_range);
                }
                if (cloudProfile.wellness_focus && !userWellnessFocus) {
                    setUserWellnessFocus(cloudProfile.wellness_focus);
                }
                // Sync invite code (server authority)
                if (cloudProfile.invite_code && cloudProfile.invite_code !== inviteCode) {
                    setInviteCode(cloudProfile.invite_code);
                }
                // Sync membership status (server authority)
                if (cloudProfile.membership_status) {
                    setMembershipStatus(cloudProfile.membership_status);
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

        // Get fresh state to avoid stale closures
        const state = useWellnessStore.getState();
        const freshInviteCode = state.inviteCode;

        // Don't sync if invite code is missing or default/invalid
        if (!freshInviteCode || freshInviteCode.length < 4) {
            return;
        }

        try {
            // Update profile
            await updateProfile({
                name: state.userName,
                avatar_url: state.userAvatar,
                age_range: state.userAgeRange,
                wellness_focus: state.userWellnessFocus,
                invite_code: freshInviteCode, // Ensure local invite code is synced to cloud
            });

            // Sync daily progress
            const { pointsToday, goalsCompletedToday, totalGoalsToday } = getTodayProgress();

            // Use fresh state for all values
            await syncProgress(
                state.plantLevel,
                state.plantPoints,
                state.currentStreak,
                state.longestStreak,
                pointsToday,
                goalsCompletedToday,
                totalGoalsToday,
                state.membershipStatus
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

    // Subscribe to real-time profile updates (e.g. membership status change)
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`profile_updates_${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${user.id}`,
                },
                (payload: any) => {
                    console.log("Profile updated from cloud:", payload);
                    // Re-sync from cloud to get latest membership status etc.
                    pullFromCloud();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return {
        isAuthenticated: !!user,
        syncNow: pushToCloud,
    };
}
