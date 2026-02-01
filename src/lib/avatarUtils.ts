import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

const AVATARS_BUCKET = "avatars";

// Default avatar URL for fallback
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200";

/**
 * Upload an avatar image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadAvatar(localUri: string): Promise<string | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn("No user logged in, cannot upload avatar to cloud");
            return null;
        }

        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Generate unique filename
        const fileExt = localUri.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(AVATARS_BUCKET)
            .upload(filePath, decode(base64), {
                contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
                upsert: true,
            });

        if (error) {
            console.error("Error uploading avatar:", error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(AVATARS_BUCKET)
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error("Error in uploadAvatar:", error);
        return null;
    }
}

/**
 * Save avatar locally to document directory for persistence
 * Returns the new local URI
 */
export async function saveAvatarLocally(sourceUri: string): Promise<string | null> {
    try {
        // Skip if already a remote URL or already in document directory
        if (
            sourceUri.startsWith("http://") ||
            sourceUri.startsWith("https://") ||
            sourceUri.startsWith(FileSystem.documentDirectory || "")
        ) {
            return sourceUri;
        }

        // Create avatars directory if it doesn't exist
        const avatarsDir = `${FileSystem.documentDirectory}avatars/`;
        const dirInfo = await FileSystem.getInfoAsync(avatarsDir);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(avatarsDir, { intermediates: true });
        }

        // Generate unique filename
        const fileExt = sourceUri.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `avatar_${Date.now()}.${fileExt}`;
        const destUri = `${avatarsDir}${fileName}`;

        // Copy the file
        await FileSystem.copyAsync({
            from: sourceUri,
            to: destUri,
        });

        return destUri;
    } catch (error) {
        console.error("Error saving avatar locally:", error);
        return null;
    }
}

/**
 * Check if an avatar URI is valid and accessible
 */
export async function isAvatarValid(uri: string | null | undefined): Promise<boolean> {
    if (!uri) return false;

    // Remote URLs are assumed valid (Image component will handle errors)
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
        return true;
    }

    // Check if local file exists
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        return fileInfo.exists;
    } catch {
        return false;
    }
}

/**
 * Get the best available avatar URL
 * Priority: local saved > cloud > default
 */
export async function getValidAvatarUri(localUri: string | null, cloudUri: string | null): Promise<string> {
    // Check local first
    if (localUri && await isAvatarValid(localUri)) {
        return localUri;
    }

    // Check cloud
    if (cloudUri && await isAvatarValid(cloudUri)) {
        return cloudUri;
    }

    // Fallback to default
    return DEFAULT_AVATAR;
}

/**
 * Check if a URI is a local file path (vs remote URL)
 */
export function isLocalFile(uri: string): boolean {
    return uri.startsWith("file://") || uri.startsWith("/");
}

/**
 * Check if a URI is a preset avatar (remote URL)
 */
export function isPresetAvatar(uri: string): boolean {
    return uri.includes("unsplash.com");
}
