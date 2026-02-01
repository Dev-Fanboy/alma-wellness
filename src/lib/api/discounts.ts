import { supabase } from "@/lib/supabase";

export interface PartnerDiscount {
    id: string;
    partner_name: string;
    category: string;
    discount_value: string;
    description: string;
    image_url: string;
    location: string;
    hours: string;
    terms: string | null;
    redemption_code: string | null;
    valid_until: string | null;
    min_level_required: number;
    is_featured: boolean;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

// Fetch all active partner discounts, featured first, then by sort_order
export async function getPartnerDiscounts(): Promise<{ data: PartnerDiscount[] | null; error: any }> {
    const { data, error } = await supabase
        .from("partner_discounts")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true });

    return { data: data as PartnerDiscount[], error };
}

// Fetch a single partner discount by ID
export async function getPartnerDiscountById(id: string): Promise<{ data: PartnerDiscount | null; error: any }> {
    const { data, error } = await supabase
        .from("partner_discounts")
        .select("*")
        .eq("id", id)
        .single();

    return { data: data as PartnerDiscount, error };
}
