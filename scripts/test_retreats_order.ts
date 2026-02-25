
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrdering() {
    console.log("Testing order by 'start_date'...");

    const { data, error } = await supabase
        .from('retreats')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: true });

    if (error) {
        console.error("Error ordering by start_date:", error);
    } else {
        console.log("Success ordering by start_date. Rows:", data?.length);
    }

    console.log("\nTesting order by 'sort_order'...");
    const { data: data2, error: error2 } = await supabase
        .from('retreats')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error2) {
        console.error("Error ordering by sort_order:", error2);
    } else {
        console.log("Success ordering by sort_order. Rows:", data2?.length);
    }
}

checkOrdering();
