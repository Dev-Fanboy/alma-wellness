import { supabase } from "@/lib/supabase";
import { JournalEntry } from "@/lib/store";

// Fetch all journal entries for current user
export async function getJournalEntries(): Promise<JournalEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false });

    if (error || !data) return [];

    return data.map((entry) => ({
        id: entry.id,
        date: entry.entry_date,
        content: entry.content,
        mood: entry.mood,
        prompt: entry.prompt,
    }));
}

// Create a new journal entry
export async function createJournalEntry(entry: Omit<JournalEntry, "id">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    const { data, error } = await supabase
        .from("journal_entries")
        .insert({
            user_id: user.id,
            content: entry.content,
            mood: entry.mood,
            prompt: entry.prompt,
            entry_date: entry.date,
        })
        .select()
        .single();

    return { data, error };
}

// Update a journal entry
export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    const { data, error } = await supabase
        .from("journal_entries")
        .update({
            content: updates.content,
            mood: updates.mood,
            prompt: updates.prompt,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    return { data, error };
}

// Delete a journal entry
export async function deleteJournalEntry(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Not authenticated" } };

    const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    return { error };
}

// Sync all local journal entries to cloud (for initial migration)
export async function syncJournalEntriesToCloud(entries: JournalEntry[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || entries.length === 0) return { error: null };

    const cloudEntries = entries.map((entry) => ({
        id: entry.id,
        user_id: user.id,
        content: entry.content,
        mood: entry.mood,
        prompt: entry.prompt,
        entry_date: entry.date,
    }));

    const { error } = await supabase
        .from("journal_entries")
        .upsert(cloudEntries, { onConflict: "user_id,id" });

    return { error };
}
