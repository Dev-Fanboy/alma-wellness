import { supabase } from "@/lib/supabase";

export interface Retreat {
    id: string;
    created_at: string;
    title: string;
    description: string;
    full_description: string;
    location: string;
    date: string; // Display date string
    // start_date: string; // Removed as column does not exist
    sort_order: number;
    end_date?: string;
    price: number | string;
    currency: string; // 'USD', 'NGN', etc.
    image_url: string;
    max_attendees: number;
    // attendees: number; // Removed as not in provided schema
    is_alma_exclusive: boolean;
    registration_url: string;
    is_active: boolean;
    facilitator: string;
    theme: string;
    includes: string[]; // Array of strings
}

// Fetch all active retreats, ordered by upcoming first, then by sort_order
export async function getRetreats(): Promise<{ data: Retreat[] | null; error: any }> {
    const { data, error } = await supabase
        .from("retreats")
        .select("*")
        .eq("is_active", true)
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
