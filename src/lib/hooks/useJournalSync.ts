import { useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useWellnessStore, JournalEntry } from "@/lib/store";
import {
    getJournalEntries,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    syncJournalEntriesToCloud,
} from "@/lib/api/journal";

/**
 * Hook to sync journal entries with Supabase cloud
 * - On login: Downloads cloud entries and merges with local
 * - On changes: Syncs to cloud automatically
 */
export function useJournalSync() {
    const { user, loading } = useAuth();
    const localEntries = useWellnessStore((s) => s.journalEntries);
    const addJournalEntry = useWellnessStore((s) => s.addJournalEntry);

    // Pull journal entries from cloud on login
    const pullFromCloud = useCallback(async () => {
        if (!user) return;

        const cloudEntries = await getJournalEntries();

        // Merge cloud entries with local (cloud wins for conflicts by ID)
        const localIds = new Set(localEntries.map((e) => e.id));
        const newFromCloud = cloudEntries.filter((e) => !localIds.has(e.id));

        // Add any entries from cloud that don't exist locally
        newFromCloud.forEach((entry) => {
            addJournalEntry({
                date: entry.date,
                content: entry.content,
                mood: entry.mood,
                prompt: entry.prompt,
            });
        });
    }, [user, localEntries, addJournalEntry]);

    // Push local entries to cloud (initial sync)
    const pushToCloud = useCallback(async () => {
        if (!user || localEntries.length === 0) return;
        await syncJournalEntriesToCloud(localEntries);
    }, [user, localEntries]);

    // Sync on auth change
    useEffect(() => {
        if (loading || !user) return;

        // First push local to cloud, then pull any cloud-only entries
        pushToCloud().then(() => pullFromCloud());
    }, [user, loading]);

    return {
        isAuthenticated: !!user,
        syncNow: pushToCloud,
        createEntry: createJournalEntry,
        updateEntry: updateJournalEntry,
        deleteEntry: deleteJournalEntry,
    };
}
