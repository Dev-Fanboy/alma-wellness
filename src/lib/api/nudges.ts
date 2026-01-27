import { supabase } from "@/lib/supabase";

export interface Nudge {
    id: string;
    from_user_id: string;
    to_user_id: string;
    message: string;
    read: boolean;
    created_at: string;
    sender?: {
        name: string;
        avatar_url: string;
    };
}

// Send a nudge (rain) to a friend
export async function sendNudge(toUserId: string, message?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    const { data, error } = await supabase
        .from("nudges")
        .insert({
            from_user_id: user.id,
            to_user_id: toUserId,
            message: message || "sent you some rain! 🌧️",
        })
        .select()
        .single();

    return { data, error };
}

// Get unread nudges
export async function getUnreadNudges(): Promise<{ data: Nudge[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: "Not authenticated" } };

    const { data, error } = await supabase
        .from("nudges")
        .select(`
      *,
      sender:profiles!nudges_from_user_id_fkey(name, avatar_url)
    `)
        .eq("to_user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false });

    return { data: data as Nudge[], error };
}

// Mark nudges as read
export async function markNudgesAsRead(nudgeIds: string[]) {
    const { error } = await supabase
        .from("nudges")
        .update({ read: true })
        .in("id", nudgeIds);

    return { error };
}

// Subscribe to real-time nudges
export function subscribeToNudges(
    userId: string,
    onNudge: (nudge: Nudge) => void
) {
    const channel = supabase
        .channel("nudges")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "nudges",
                filter: `to_user_id=eq.${userId}`,
            },
            async (payload) => {
                // Fetch sender info
                const { data: sender } = await supabase
                    .from("profiles")
                    .select("name, avatar_url")
                    .eq("id", payload.new.from_user_id)
                    .single();

                onNudge({
                    ...payload.new as Nudge,
                    sender: sender || undefined,
                });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// Subscribe to real-time friend updates (for live status)
export function subscribeToFriendUpdates(
    friendIds: string[],
    onUpdate: (profile: any) => void
) {
    if (friendIds.length === 0) return () => { };

    const channel = supabase
        .channel("friend_updates")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "profiles",
                filter: `id=in.(${friendIds.join(",")})`,
            },
            (payload) => {
                onUpdate(payload.new);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
