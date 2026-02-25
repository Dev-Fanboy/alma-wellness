import { supabase } from "@/lib/supabase";
import { sendPushNotification } from "@/lib/api/notifications";

export interface Profile {
    id: string;
    name: string;
    avatar_url: string;
    age_range?: string;
    wellness_focus?: string;
    plant_level: number;
    plant_points: number;
    current_streak: number;
    longest_streak: number;
    invite_code: string;
    last_active_at: string;
    created_at: string;
    friends_garden_streak: number;
    friends_garden_last_met: string | null;
    membership_status: "active" | "expired";
}

export interface Friendship {
    id: string;
    user_id: string;
    friend_id: string;
    status: "pending" | "accepted" | "blocked";
    created_at: string;
    friend?: Profile;
}

// Get current user's profile
export async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
    return data as Profile;
}

// Update user profile
export async function updateProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();

    return { data, error };
}

// Sync local wellness data to cloud
export async function syncProgress(
    plantLevel: number,
    plantPoints: number,
    currentStreak: number,
    longestStreak: number,
    pointsToday: number,
    goalsCompletedToday: number,
    totalGoalsToday: number,
    membershipStatus: "active" | "expired"
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    // Update profile
    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            plant_level: plantLevel,
            plant_points: plantPoints,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            last_active_at: new Date().toISOString(),
            membership_status: membershipStatus,
        })
        .eq("id", user.id);

    if (profileError) return { error: profileError };

    // Upsert daily progress
    const today = new Date().toISOString().split("T")[0];
    const { error: progressError } = await supabase
        .from("daily_progress")
        .upsert({
            user_id: user.id,
            date: today,
            points_earned: pointsToday,
            goals_completed: goalsCompletedToday,
            total_goals: totalGoalsToday,
        }, { onConflict: "user_id,date" });

    return { error: progressError };
}

/**
 * Combined sync: profile fields + progress + daily stats in one call.
 * Accepts a pre-cached userId to avoid redundant getUser() roundtrips.
 */
export async function syncAllData(
    userId: string,
    profileFields: {
        name: string;
        avatar_url: string;
        age_range: string;
        wellness_focus: string;
        invite_code: string;
    },
    progressFields: {
        plant_level: number;
        plant_points: number;
        current_streak: number;
        longest_streak: number;
        membership_status: "active" | "expired";
    },
    dailyStats: {
        points_earned: number;
        goals_completed: number;
        total_goals: number;
    }
) {
    const now = new Date().toISOString();
    const today = now.split("T")[0];

    // Single profile update combining all fields
    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            ...profileFields,
            ...progressFields,
            last_active_at: now,
            updated_at: now,
        })
        .eq("id", userId);

    if (profileError) return { error: profileError };

    // Upsert daily progress
    const { error: progressError } = await supabase
        .from("daily_progress")
        .upsert({
            user_id: userId,
            date: today,
            ...dailyStats,
        }, { onConflict: "user_id,date" });

    return { error: progressError };
}

/**
 * Check and increment friends garden streak if goal met
 */
export async function checkAndIncrementFriendsStreak(totalPoints: number) {
    if (totalPoints < 2500) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("friends_garden_streak, friends_garden_last_met")
            .eq("id", user.id)
            .single();

        if (error || !profile) return;

        const now = new Date();
        const lastMet = profile.friends_garden_last_met ? new Date(profile.friends_garden_last_met) : null;

        // Calculate start of current week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // If outcome already met this week, do nothing
        if (lastMet && lastMet >= startOfWeek) {
            return;
        }

        // Increment streak
        await supabase
            .from("profiles")
            .update({
                friends_garden_streak: (profile.friends_garden_streak || 0) + 1,
                friends_garden_last_met: now.toISOString(),
            })
            .eq("id", user.id);

    } catch (e) {
        console.error("Error updating friends streak:", e);
    }
}

// Get friends list with profiles
export async function getFriends(): Promise<{ data: Profile[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: "Not authenticated" } };

    // Fetch friendships where user is the initiator (user_id)
    const { data: sentFriendships, error: sentError } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", user.id)
        .eq("status", "accepted");

    if (sentError) return { data: null, error: sentError };

    // Fetch friendships where user is the receiver (friend_id)
    const { data: receivedFriendships, error: receivedError } = await supabase
        .from("friendships")
        .select("user_id")
        .eq("friend_id", user.id)
        .eq("status", "accepted");

    if (receivedError) return { data: null, error: receivedError };

    // Combine friend IDs
    const sentIds = sentFriendships?.map(f => f.friend_id) || [];
    const receivedIds = receivedFriendships?.map(f => f.user_id) || [];
    const friendIds = [...new Set([...sentIds, ...receivedIds])]; // Deduplicate

    if (friendIds.length === 0) return { data: [], error: null };

    // Get friend profiles
    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", friendIds);

    return { data: profiles as Profile[], error: profileError };
}

// Get pending friend requests
export async function getPendingRequests(): Promise<{ data: Friendship[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: "Not authenticated" } };

    const { data, error } = await supabase
        .from("friendships")
        .select(`
      *,
      friend:profiles!friendships_user_id_fkey(*)
    `)
        .eq("friend_id", user.id)
        .eq("status", "pending");

    return { data: data as Friendship[], error };
}

// Send friend request by invite code
export async function sendFriendRequestByCode(inviteCode: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    // Find user by invite code
    const { data: friend, error: lookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

    if (lookupError || !friend) {
        return { error: { message: "Invalid invite code" } };
    }

    if (friend.id === user.id) {
        return { error: { message: "You can't add yourself!" } };
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
        .from("friendships")
        .select("id, status")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friend.id}),and(user_id.eq.${friend.id},friend_id.eq.${user.id})`)
        .single();

    if (existing) {
        if (existing.status === "accepted") {
            return { error: { message: "Already friends!" } };
        }
        return { error: { message: "Request already sent" } };
    }

    // Create friend request
    const { data, error } = await supabase
        .from("friendships")
        .insert({ user_id: user.id, friend_id: friend.id })
        .select()
        .single();

    return { data, error };
}

// Accept friend request
export async function acceptFriendRequest(friendshipId: string) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId)
        .select()
        .single();

    return { data, error };
}

// Remove friend by User ID
export async function removeFriend(friendUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    const { error } = await supabase
        .from("friendships")
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_id.eq.${user.id})`);

    return { error };
}

// Get weekly XP for grove vitality
export async function getWeeklyGroupXP(friendIds: string[]): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const allIds = [user.id, ...friendIds];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
        .from("daily_progress")
        .select("points_earned")
        .in("user_id", allIds)
        .gte("date", weekAgo.toISOString().split("T")[0]);

    if (error || !data) return 0;
    return data.reduce((sum, d) => sum + (d.points_earned || 0), 0);
}
