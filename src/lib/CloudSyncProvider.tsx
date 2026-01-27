import React, { createContext, useContext, ReactNode } from "react";
import { useCloudSync } from "@/lib/hooks/useCloudSync";

interface CloudSyncContextType {
    isAuthenticated: boolean;
    syncNow: () => Promise<void>;
}

const CloudSyncContext = createContext<CloudSyncContextType>({
    isAuthenticated: false,
    syncNow: async () => { },
});

/**
 * Provider component that activates cloud sync
 * Place inside AuthProvider in app layout
 */
export function CloudSyncProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, syncNow } = useCloudSync();

    return (
        <CloudSyncContext.Provider value={{ isAuthenticated, syncNow }}>
            {children}
        </CloudSyncContext.Provider>
    );
}

export function useCloudSyncContext() {
    return useContext(CloudSyncContext);
}
