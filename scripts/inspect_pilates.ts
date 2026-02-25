
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPilates() {
    console.log("Fetching Pilates retreat...");

    const { data, error } = await supabase
        .from('retreats')
        .select('*')
        .ilike('title', '%pilates%');

    if (error) {
        console.error("Error fetching pilates:", error);
    } else {
        console.log("Pilates Retreat Data:", JSON.stringify(data, null, 2));
    }
}

checkPilates();
