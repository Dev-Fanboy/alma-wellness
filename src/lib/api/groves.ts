import { supabase } from "@/lib/supabase";

export interface Grove {
    id: string;
    name: string;
    invite_code: string;
    owner_id: string;
    description?: string;
    max_members: number;
    created_at: string;
    updated_at: string;
    current_streak: number;
    last_goal_met_date: string | null;
}

export interface GroveMember {
    grove_id: string;
    user_id: string;
    role: "owner" | "admin" | "member";
    joined_at: string;
    // Joined profile data
    profile?: {
        id: string;
        name: string;
        avatar_url: string;
        plant_level: number;
        plant_points: number;
        current_streak: number;
        last_active_at: string;
    };
}

export interface GroveWithMembers extends Grove {
    members: GroveMember[];
    memberCount: number;
}

/**
 * Create a new grove
 */
export async function createGrove(name: string, description?: string): Promise<{ data: Grove | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: "Not authenticated" } };

    // Use the RPC function to create grove with owner
    const { data, error } = await supabase
        .rpc("create_grove_with_owner", {
            grove_name: name,
            grove_description: description || null,
        });

    if (error) {
        console.error("Error creating grove:", error);
        return { data: null, error };
    }

    return { data: data as Grove, error: null };
}

/**
 * Get all groves the current user is a member of
 */
export async function getMyGroves(): Promise<{ data: GroveWithMembers[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: "Not authenticated" } };

    // Get grove IDs the user is a member of
    const { data: memberships, error: memberError } = await supabase
        .from("grove_members")
        .select("grove_id")
        .eq("user_id", user.id);

    if (memberError) {
        console.error("Error fetching memberships:", memberError);
        return { data: null, error: memberError };
    }

    if (!memberships || memberships.length === 0) {
        return { data: [], error: null };
    }

    const groveIds = memberships.map((m) => m.grove_id);

    // Get groves with member counts
    const { data: groves, error: groveError } = await supabase
        .from("groves")
        .select("*")
        .in("id", groveIds);

    if (groveError) {
        console.error("Error fetching groves:", groveError);
        return { data: null, error: groveError };
    }

    // Get members for each grove
    const grovesWithMembers: GroveWithMembers[] = await Promise.all(
        (groves || []).map(async (grove) => {
            const { data: members } = await getGroveMembers(grove.id);
            return {
                ...grove,
                members: members || [],
                memberCount: members?.length || 0,
            };
        })
    );

    return { data: grovesWithMembers, error: null };
}

/**
 * Get members of a specific grove with their profiles
 */
export async function getGroveMembers(groveId: string): Promise<{ data: GroveMember[] | null; error: any }> {
    const { data, error } = await supabase
        .from("grove_members")
        .select(`
            grove_id,
            user_id,
            role,
            joined_at,
            profile:profiles(
                id,
                name,
                avatar_url,
                plant_level,
                plant_points,
                current_streak,
                last_active_at
            )
        `)
        .eq("grove_id", groveId);

    if (error) {
        console.error("Error fetching grove members:", error);
        return { data: null, error };
    }

    // Transform the nested profile data
    const members = (data || []).map((m: any) => ({
        grove_id: m.grove_id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        profile: m.profile,
    }));

    return { data: members, error: null };
}

/**
 * Get grove by invite code
 */
export async function getGroveByCode(inviteCode: string): Promise<{ data: Grove | null; error: any }> {
    const { data, error } = await supabase
        .from("groves")
        .select("*")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { data: null, error: { message: "Garden not found" } };
        }
        return { data: null, error };
    }

    return { data: data as Grove, error: null };
}

/**
 * Join a grove using invite code
 */
export async function joinGroveByCode(inviteCode: string): Promise<{ data: Grove | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: "Not authenticated" } };

    // Find the grove by invite code
    const { data: grove, error: lookupError } = await getGroveByCode(inviteCode);
    if (lookupError || !grove) {
        return { data: null, error: lookupError || { message: "Garden not found" } };
    }

    // Check if already a member
    const { data: existing } = await supabase
        .from("grove_members")
        .select("grove_id")
        .eq("grove_id", grove.id)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        return { data: null, error: { message: "You're already a member of this garden" } };
    }

    // Check member count
    const { data: memberCount } = await supabase
        .from("grove_members")
        .select("user_id", { count: "exact" })
        .eq("grove_id", grove.id);

    if (memberCount && memberCount.length >= grove.max_members) {
        return { data: null, error: { message: "This garden is full" } };
    }

    // Join the grove
    const { error: joinError } = await supabase
        .from("grove_members")
        .insert({
            grove_id: grove.id,
            user_id: user.id,
            role: "member",
        });

    if (joinError) {
        console.error("Error joining grove:", joinError);
        return { data: null, error: joinError };
    }

    return { data: grove, error: null };
}

/**
 * Leave a grove
 */
export async function leaveGrove(groveId: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    // Check if user is the owner
    const { data: grove } = await supabase
        .from("groves")
        .select("owner_id")
        .eq("id", groveId)
        .single();

    if (grove?.owner_id === user.id) {
        return { error: { message: "Owners cannot leave their garden. Delete it instead." } };
    }

    const { error } = await supabase
        .from("grove_members")
        .delete()
        .eq("grove_id", groveId)
        .eq("user_id", user.id);

    return { error };
}

/**
 * Delete a grove (owner only)
 */
export async function deleteGrove(groveId: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    const { error } = await supabase
        .from("groves")
        .delete()
        .eq("id", groveId)
        .eq("owner_id", user.id);

    return { error };
}

/**
 * Update grove details (owner only)
 */
export async function updateGrove(groveId: string, updates: { name?: string; description?: string }): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    const { error } = await supabase
        .from("groves")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", groveId)
        .eq("owner_id", user.id);

    return { error };
}

/**
 * Remove a member from a grove (owner/admin only)
 */
export async function removeMember(groveId: string, userId: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    // Verify caller is owner or admin
    const { data: callerMembership } = await supabase
        .from("grove_members")
        .select("role")
        .eq("grove_id", groveId)
        .eq("user_id", user.id)
        .single();

    if (!callerMembership || (callerMembership.role !== "owner" && callerMembership.role !== "admin")) {
        return { error: { message: "Only owners and admins can remove members" } };
    }

    // Cannot remove the owner
    const { data: targetMembership } = await supabase
        .from("grove_members")
        .select("role")
        .eq("grove_id", groveId)
        .eq("user_id", userId)
        .single();

    if (targetMembership?.role === "owner") {
        return { error: { message: "Cannot remove the garden owner" } };
    }

    const { error } = await supabase
        .from("grove_members")
        .delete()
        .eq("grove_id", groveId)
        .eq("user_id", userId);

    return { error };
}

/**
 * Check and increment streak if goal met
 */
export async function checkAndIncrementStreak(groveId: string, totalPoints: number) {
    if (totalPoints < 2500) return;

    try {
        const { data: grove, error } = await supabase
            .from("groves")
            .select("current_streak, last_goal_met_date")
            .eq("id", groveId)
            .single();

        if (error || !grove) return;

        const now = new Date();
        const lastMet = grove.last_goal_met_date ? new Date(grove.last_goal_met_date) : null;

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
            .from("groves")
            .update({
                current_streak: (grove.current_streak || 0) + 1,
                last_goal_met_date: now.toISOString(),
            })
            .eq("id", groveId);

    } catch (e) {
        console.error("Error updating streak:", e);
    }
}
