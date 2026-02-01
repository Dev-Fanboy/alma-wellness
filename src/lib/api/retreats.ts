import { supabase } from "@/lib/supabase";

export interface Retreat {
    id: string;
    title: string;
    description: string;
    full_description: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    max_attendees: number;
    image_url: string;
    is_past: boolean;
    is_upcoming: boolean;
    is_alma_exclusive: boolean;
    theme: string;
    price: string;
    includes: string[];
    facilitator: string;
    registration_url: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

// Fetch all active retreats, ordered by upcoming first, then by sort_order
export async function getRetreats(): Promise<{ data: Retreat[] | null; error: any }> {
    const { data, error } = await supabase
        .from("retreats")
        .select("*")
        .eq("is_active", true)
        .order("is_upcoming", { ascending: false })
        .order("is_past", { ascending: true })
        .order("sort_order", { ascending: true });

    return { data: data as Retreat[], error };
}

// Fetch a single retreat by ID
export async function getRetreatById(id: string): Promise<{ data: Retreat | null; error: any }> {
    const { data, error } = await supabase
        .from("retreats")
        .select("*")
        .eq("id", id)
        .single();

    return { data: data as Retreat, error };
}
