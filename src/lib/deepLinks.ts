/**
 * Deep Link Utilities for Alma Wellness
 * Handles generation and parsing of invite links
 */

import * as Linking from "expo-linking";

// URL scheme configured in app.json
const URL_SCHEME = "alma-wellness";

export type DeepLinkType = "invite";

export interface ParsedDeepLink {
    type: DeepLinkType;
    code: string;
}

/**
 * Generate a shareable invite link
 * Format: alma-wellness://invite?code=ALMAX7F2
 */
export function generateInviteLink(inviteCode: string): string {
    return `${URL_SCHEME}://invite?code=${inviteCode}`;
}

/**
 * Generate a share message with the invite link
 */
export function generateShareMessage(inviteCode: string, userName?: string): string {
    const link = generateInviteLink(inviteCode);
    const name = userName || "a friend";
    return `Join me on Alma Wellness! 🌱\n\nTap to join my garden:\n${link}`;
}

/**
 * Parse a deep link URL and extract the invite code
 * Returns null if URL is not a valid invite link
 */
export function parseDeepLink(url: string): ParsedDeepLink | null {
    try {
        const parsed = Linking.parse(url);

        // Check if it's an invite link
        // Handle both alma-wellness://invite?code=X and expo paths
        if (parsed.path === "invite" || parsed.hostname === "invite") {
            const code = parsed.queryParams?.code;
            if (typeof code === "string" && code.length > 0) {
                return {
                    type: "invite",
                    code: code.toUpperCase(),
                };
            }
        }

        return null;
    } catch (error) {
        console.error("Failed to parse deep link:", error);
        return null;
    }
}

/**
 * Get the initial URL that opened the app (cold start)
 */
export async function getInitialDeepLink(): Promise<ParsedDeepLink | null> {
    try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
            return parseDeepLink(initialUrl);
        }
        return null;
    } catch (error) {
        console.error("Failed to get initial deep link:", error);
        return null;
    }
}

/**
 * Subscribe to incoming deep links (warm start / background)
 * Returns a cleanup function
 */
export function subscribeToDeepLinks(
    callback: (link: ParsedDeepLink) => void
): () => void {
    const subscription = Linking.addEventListener("url", (event) => {
        const parsed = parseDeepLink(event.url);
        if (parsed) {
            callback(parsed);
        }
    });

    return () => subscription.remove();
}
