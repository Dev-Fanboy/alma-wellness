import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { getFriends, getPendingRequests, sendFriendRequestByCode, acceptFriendRequest, removeFriend as removeFriendApi, Profile, Friendship } from "@/lib/api/profile";
import { subscribeToFriendUpdates } from "@/lib/api/nudges";

export interface FriendWithStatus extends Profile {
    isOnline: boolean;
    weeklyPoints: number;
    lastActive: number; // hours since last active
}

/**
 * Hook to manage friends from Supabase
 * Falls back to empty array when not authenticated
 */
export function useFriends() {
    const { user, loading: authLoading } = useAuth();
    const [friends, setFriends] = useState<FriendWithStatus[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Calculate hours since last active
    const getHoursSinceActive = (lastActiveAt: string): number => {
        const lastActive = new Date(lastActiveAt);
        const now = new Date();
        const diffMs = now.getTime() - lastActive.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60));
    };

    // Transform Profile to FriendWithStatus
    const transformProfile = (profile: Profile): FriendWithStatus => {
        const hoursSinceActive = getHoursSinceActive(profile.last_active_at);
        return {
            ...profile,
            isOnline: hoursSinceActive < 1,
            lastActive: hoursSinceActive,
            weeklyPoints: Math.floor(profile.plant_points * 0.15), // Estimate weekly from total
        };
    };

    // Fetch friends list
    const fetchFriends = useCallback(async () => {
        if (!user) {
            setFriends([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await getFriends();

            if (fetchError) {
                setError(fetchError.message);
                setFriends([]);
            } else if (data) {
                setFriends(data.map(transformProfile));
                setError(null);
            }
        } catch (err: any) {
            setError(err.message);
            setFriends([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch pending requests
    const fetchPendingRequests = useCallback(async () => {
        if (!user) {
            setPendingRequests([]);
            return;
        }

        try {
            const { data, error: fetchError } = await getPendingRequests();
            if (!fetchError && data) {
                setPendingRequests(data);
            }
        } catch (err) {
            console.error("Error fetching pending requests:", err);
        }
    }, [user]);

    // Send friend request by invite code
    const addFriendByCode = useCallback(async (inviteCode: string) => {
        if (!user) return { error: { message: "Please sign in first" } };

        const { data, error } = await sendFriendRequestByCode(inviteCode);
        if (!error) {
            // Refresh friends list
            await fetchFriends();
        }
        return { data, error };
    }, [user, fetchFriends]);

    // Accept a friend request
    const acceptRequest = useCallback(async (friendshipId: string) => {
        // Optimistic update
        const requestToAccept = pendingRequests.find(r => r.id === friendshipId);
        if (requestToAccept && requestToAccept.friend) {
            // Remove from pending
            setPendingRequests(prev => prev.filter(r => r.id !== friendshipId));

            // Add to friends list (optimistically)
            const newFriend = transformProfile(requestToAccept.friend as Profile);
            setFriends(prev => [...prev, newFriend]);
        }

        const { error } = await acceptFriendRequest(friendshipId);

        if (error) {
            // Revert changes on error
            await fetchPendingRequests();
            await fetchFriends();
        } else {
            // Confirm with server state in background
            fetchFriends();
            fetchPendingRequests();
        }
        return { error };
    }, [pendingRequests, fetchFriends, fetchPendingRequests]);


    // Remove a friend
    const removeFriend = useCallback(async (friendUserId: string) => {
        const { error } = await removeFriendApi(friendUserId);
        if (!error) {
            setFriends((prev) => prev.filter((f) => f.id !== friendUserId));
        }
        return { error };
    }, []);

    // Reject a friend request
    const rejectRequest = useCallback(async (friendUserId: string) => {
        const { error } = await removeFriendApi(friendUserId);
        if (!error) {
            setPendingRequests((prev) => prev.filter((r) => r.user_id !== friendUserId && r.friend_id !== friendUserId));
            await fetchPendingRequests();
        }
        return { error };
    }, [fetchPendingRequests]);

    // Initial fetch
    useEffect(() => {
        if (!authLoading) {
            fetchFriends();
            fetchPendingRequests();
        }
    }, [user, authLoading, fetchFriends, fetchPendingRequests]);

    // Subscribe to incoming friend requests and updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel("friendship_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "friendships",
                    filter: `friend_id=eq.${user.id}`, // Listen for requests sent TO me
                },
                () => {
                    fetchPendingRequests();
                    fetchFriends(); // In case a request was accepted
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "friendships",
                    filter: `user_id=eq.${user.id}`, // Listen for updates to requests I sent
                },
                () => {
                    fetchFriends(); // If my request was accepted
                    fetchPendingRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchFriends, fetchPendingRequests]);

    // Subscribe to real-time friend updates
    useEffect(() => {
        if (!user || friends.length === 0) return;

        const friendIds = friends.map((f) => f.id);
        const unsubscribe = subscribeToFriendUpdates(friendIds, (updatedProfile) => {
            setFriends((prev) =>
                prev.map((f) =>
                    f.id === updatedProfile.id
                        ? transformProfile(updatedProfile as Profile)
                        : f
                )
            );
        });

        return unsubscribe;
    }, [user, friends.length]);

    return {
        friends,
        pendingRequests,
        loading: authLoading || loading,
        error,
        isAuthenticated: !!user,
        addFriendByCode,
        acceptRequest,
        rejectRequest,
        removeFriend,
        refresh: fetchFriends,
    };
}
