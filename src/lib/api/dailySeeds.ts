import { supabase } from "@/lib/supabase";

export interface DailySeed {
    id: string;
    content: string;
    publish_date: string;
    created_at: string;
}

export async function fetchDailySeeds() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from("daily_seeds")
        .select("*")
        .lte("publish_date", today)
        .order("publish_date", { ascending: false })
        .limit(4);

    if (error) {
        console.error("Error fetching daily seeds:", error);
        throw error;
    }

    return data as DailySeed[];
}
