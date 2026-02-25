import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
    Grove,
    GroveWithMembers,
    GroveMember,
    getMyGroves,
    createGrove as createGroveApi,
    joinGroveByCode as joinGroveApi,
    leaveGrove as leaveGroveApi,
    deleteGrove as deleteGroveApi,
    removeMember as removeMemberApi,
} from "@/lib/api/groves";

export interface GroveDisplayMember {
    id: string;
    name: string;
    avatar: string;
    plantLevel: number;
    totalPoints: number;
    weeklyPoints: number;
    currentStreak: number;
    isOnline: boolean;
    lastActive: number;
    role: "owner" | "admin" | "member";
    isUser?: boolean;
}

export interface DisplayGrove {
    id: string;
    name: string;
    inviteCode: string;
    isOwner: boolean;
    memberCount: number;
    members: GroveDisplayMember[];
    current_streak?: number;
}

/**
 * Hook to manage groves (community gardens)
 */
export function useGroves() {
    const { user } = useAuth();
    const [groves, setGroves] = useState<DisplayGrove[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch all groves the user is a member of
     */
    const fetchGroves = useCallback(async () => {
        if (!user) {
            setGroves([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await getMyGroves();

            if (fetchError) {
                setError(fetchError.message);
                return;
            }

            if (data) {
                const displayGroves: DisplayGrove[] = data.map((grove) => ({
                    id: grove.id,
                    name: grove.name,
                    inviteCode: grove.invite_code,
                    isOwner: grove.owner_id === user.id,
                    memberCount: grove.memberCount,
                    members: grove.members.map((m) => transformMember(m, user.id)),
                }));
                setGroves(displayGroves);
            }
        } catch (e) {
            console.error("Error fetching groves:", e);
            setError("Failed to load gardens");
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Transform API member data to display format
     */
    const transformMember = (member: GroveMember, currentUserId: string): GroveDisplayMember => {
        const profile = member.profile;
        const lastActiveAt = profile?.last_active_at
            ? new Date(profile.last_active_at)
            : new Date();
        const hoursAgo = Math.floor(
            (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60)
        );

        return {
            id: member.user_id,
            name: profile?.name || "Unknown",
            avatar: profile?.avatar_url || "",
            plantLevel: profile?.plant_level || 1,
            totalPoints: profile?.plant_points || 0,
            weeklyPoints: Math.floor((profile?.plant_points || 0) * 0.15), // Estimate
            currentStreak: profile?.current_streak || 0,
            isOnline: hoursAgo < 1,
            lastActive: hoursAgo,
            role: member.role,
            isUser: member.user_id === currentUserId,
        };
    };

    /**
     * Create a new grove
     */
    const createGrove = useCallback(async (name: string, description?: string) => {
        setError(null);

        const { data, error: createError } = await createGroveApi(name, description);

        if (createError) {
            setError(createError.message);
            return { success: false, error: createError.message };
        }

        // Refresh groves list
        await fetchGroves();

        return { success: true, grove: data };
    }, [fetchGroves]);

    /**
     * Join a grove by invite code
     */
    const joinGrove = useCallback(async (inviteCode: string) => {
        setError(null);

        const { data, error: joinError } = await joinGroveApi(inviteCode);

        if (joinError) {
            setError(joinError.message);
            return { success: false, error: joinError.message };
        }

        // Refresh groves list
        await fetchGroves();

        return { success: true, grove: data };
    }, [fetchGroves]);

    /**
     * Leave a grove
     */
    const leaveGrove = useCallback(async (groveId: string) => {
        setError(null);

        const { error: leaveError } = await leaveGroveApi(groveId);

        if (leaveError) {
            setError(leaveError.message);
            return { success: false, error: leaveError.message };
        }

        // Remove from local state
        setGroves((prev) => prev.filter((g) => g.id !== groveId));

        return { success: true };
    }, []);

    /**
     * Delete a grove (owner only)
     */
    const deleteGrove = useCallback(async (groveId: string) => {
        setError(null);

        const { error: deleteError } = await deleteGroveApi(groveId);

        if (deleteError) {
            setError(deleteError.message);
            return { success: false, error: deleteError.message };
        }

        // Remove from local state
        setGroves((prev) => prev.filter((g) => g.id !== groveId));

        return { success: true };
    }, []);

    /**
     * Remove a member from a grove (owner/admin only)
     */
    const removeMember = useCallback(async (groveId: string, userId: string) => {
        setError(null);

        const { error: removeError } = await removeMemberApi(groveId, userId);

        if (removeError) {
            setError(removeError.message);
            return { success: false, error: removeError.message };
        }

        // Update local state
        setGroves((prev) =>
            prev.map((g) =>
                g.id === groveId
                    ? {
                        ...g,
                        members: g.members.filter((m) => m.id !== userId),
                        memberCount: g.memberCount - 1,
                    }
                    : g
            )
        );

        return { success: true };
    }, []);

    // Fetch groves on mount and when user changes
    useEffect(() => {
        fetchGroves();
    }, [fetchGroves]);

    return {
        groves,
        loading,
        error,
        createGrove,
        joinGrove,
        leaveGrove,
        deleteGrove,
        removeMember,
        refreshGroves: fetchGroves,
        isAuthenticated: !!user,
    };
}
