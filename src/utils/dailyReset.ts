import { useWellnessStore } from "../lib/store";

/**
 * Checks if a new day has started and resets daily goals.
 * Handles streak logic including:
 * - Incrementing streak if active yesterday
 * - Breaking streak if missed days
 * - Consuming a "Sun Stone" to save streak if available
 * 
 * @returns Object containing the status of the reset
 */
export const checkAndResetDailyGoals = () => {
    return useWellnessStore.getState().checkAndResetDaily();
};
