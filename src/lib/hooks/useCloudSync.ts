import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useWellnessStore } from "@/lib/store";
import { getProfile, syncAllData } from "@/lib/api/profile";
import { supabase } from "@/lib/supabase";
import { isAvatarRecentlySaved } from "@/lib/avatarUtils";

/**
 * Hook to sync local wellness data with Supabase cloud
 * - On login: Downloads cloud profile and merges with local
 * - On app activity: Uploads local progress to cloud
 */
export function useCloudSync() {
    const { user, loading } = useAuth();
    const lastSyncRef = useRef<number>(0);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const debouncedSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fix #8: Minimal subscriptions - only subscribe to what triggers a sync
    const plantLevel = useWellnessStore((s) => s.plantLevel);
    const plantPoints = useWellnessStore((s) => s.plantPoints);
    const currentStreak = useWellnessStore((s) => s.currentStreak);

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
    const pullFromCloud = useCallback(async () => {
        if (!user) return;

        try {
            const cloudProfile = await getProfile();
            if (!cloudProfile) return;

            const state = useWellnessStore.getState();

            // Use cloud name if local is empty
            if (!state.userName && cloudProfile.name) {
                state.setUserName(cloudProfile.name);
            }

            // Only update avatar from cloud if not recently saved locally
            const recentlySaved = await isAvatarRecentlySaved();
            if (!recentlySaved && cloudProfile.avatar_url) {
                const isLocalEmpty = !state.userAvatar || state.userAvatar.includes("unsplash.com");
                if (isLocalEmpty || cloudProfile.avatar_url === state.userAvatar) {
                    if (cloudProfile.avatar_url !== state.userAvatar) {
                        state.setUserAvatar(cloudProfile.avatar_url);
                    }
                }
            }

            // Sync age range and wellness focus
            if (cloudProfile.age_range && !state.userAgeRange) {
                state.setUserAgeRange(cloudProfile.age_range);
            }
            if (cloudProfile.wellness_focus && !state.userWellnessFocus) {
                state.setUserWellnessFocus(cloudProfile.wellness_focus);
            }

            // Sync invite code (server authority)
            if (cloudProfile.invite_code && cloudProfile.invite_code !== state.inviteCode) {
                state.setInviteCode(cloudProfile.invite_code);
            }

            // Sync membership status (server authority)
            const validStatus = cloudProfile.membership_status === 'active' ? 'active' : 'expired';
            state.setMembershipStatus(validStatus);

            // Sync progress data - use highest values
            if (cloudProfile.plant_level > state.plantLevel) {
                state.setPlantLevel(cloudProfile.plant_level);
            }
            if (cloudProfile.plant_points > state.plantPoints) {
                state.setPlantPoints(cloudProfile.plant_points);
            }
            if (cloudProfile.current_streak > state.currentStreak) {
                state.setCurrentStreak(cloudProfile.current_streak);
            }
            if (cloudProfile.longest_streak > state.longestStreak) {
                state.setLongestStreak(cloudProfile.longest_streak);
            }
        } catch (error) {
            console.error("Error pulling from cloud:", error);
        }
    }, [user]);

    // Fix #6: Combined push using syncAllData with cached user ID
    const pushToCloud = useCallback(async () => {
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
            const { pointsToday, goalsCompletedToday, totalGoalsToday } = getTodayProgress();

            // Single combined call using cached user.id — no getUser() roundtrips
            await syncAllData(
                user.id,
                {
                    name: state.userName,
                    avatar_url: state.userAvatar,
                    age_range: state.userAgeRange,
                    wellness_focus: state.userWellnessFocus,
                    invite_code: freshInviteCode,
                },
                {
                    plant_level: state.plantLevel,
                    plant_points: state.plantPoints,
                    current_streak: state.currentStreak,
                    longest_streak: state.longestStreak,
                    membership_status: state.membershipStatus,
                },
                {
                    points_earned: pointsToday,
                    goals_completed: goalsCompletedToday,
                    total_goals: totalGoalsToday,
                }
            );
        } catch (error) {
            console.error("Error pushing to cloud:", error);
        }
    }, [user]);

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

    // Debounced sync when key data changes (prevents rapid-fire on goal completion)
    useEffect(() => {
        if (!user || loading) return;

        // Clear any pending debounced sync
        if (debouncedSyncRef.current) {
            clearTimeout(debouncedSyncRef.current);
        }

        // Debounce by 2 seconds — multiple goal completions in quick succession
        // will only trigger a single sync
        debouncedSyncRef.current = setTimeout(() => {
            pushToCloud();
        }, 2000);

        return () => {
            if (debouncedSyncRef.current) {
                clearTimeout(debouncedSyncRef.current);
            }
        };
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
