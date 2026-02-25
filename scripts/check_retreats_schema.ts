
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log("Checking 'retreats' table schema...");

    // Try to select all columns for one row
    const { data, error } = await supabase
        .from('retreats')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching retreats:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No data found in 'retreats' table to inspect columns.");
        // Try inserting a dummy row if needed, or just report empty.
        // If table exists but is empty, we can't easily see columns with select * via JS client 
        // unless we get a row. 
        // But if columns were missing in query, it would error? 
        // No, select('*') gets all *existing* columns.

        // Let's try to select specific columns we care about to see if it errors
        const { error: colError } = await supabase
            .from('retreats')
            .select('is_active, currency, registration_url')
            .limit(1);

        if (colError) {
            console.error("Error selecting specific columns (is_active, currency, registration_url):", colError);
        } else {
            console.log("Successfully queried is_active, currency, registration_url. Columns exist.");
        }
        return;
    }

    const row = data[0];
    console.log("Retrieved Row Keys:", Object.keys(row));
    console.log("Sample Row:", row);

    // Check specifically for the new columns
    const missingCols = [];
    if (!('is_active' in row)) missingCols.push('is_active');
    if (!('currency' in row)) missingCols.push('currency');
    if (!('registration_url' in row)) missingCols.push('registration_url');

    if (missingCols.length > 0) {
        console.error("MISSING COLUMNS:", missingCols);
    } else {
        console.log("All expected columns (is_active, currency, registration_url) are present.");
    }
}

checkSchema();
