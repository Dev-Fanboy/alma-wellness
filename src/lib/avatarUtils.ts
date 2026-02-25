import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { decode } from "base64-arraybuffer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AVATARS_BUCKET = "avatars";

// Avatar optimization settings
const AVATAR_SIZE = 400; // 400x400 pixels
const AVATAR_QUALITY = 0.7; // 70% quality for good compression

/**
 * Optimize an image for avatar use
 * - Resize to 400x400 pixels
 * - Compress to JPEG with 0.7 quality
 * Returns the optimized image URI
 */
export async function optimizeImage(uri: string): Promise<string> {
    try {
        // Skip optimization for remote URLs (preset avatars)
        if (uri.startsWith("http://") || uri.startsWith("https://")) {
            return uri;
        }

        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: AVATAR_SIZE, height: AVATAR_SIZE } }],
            {
                compress: AVATAR_QUALITY,
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );



        return result.uri;
    } catch (error) {
        console.error("Error optimizing image:", error);
        // Return original if optimization fails
        return uri;
    }
}

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

        // Optimize image before upload (resize and compress)
        const optimizedUri = await optimizeImage(localUri);

        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(optimizedUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Log file size for debugging
        const fileSizeKB = Math.round((base64.length * 3) / 4 / 1024);


        // Generate unique filename (always JPEG after optimization)
        const fileName = `${user.id}_${Date.now()}.jpg`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(AVATARS_BUCKET)
            .upload(filePath, decode(base64), {
                contentType: "image/jpeg",
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

    // No valid avatar — return empty (UI will show silhouette)
    return "";
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

// --- Avatar save cooldown (prevents cloud sync from overwriting a freshly-saved avatar) ---

const AVATAR_SAVE_COOLDOWN_KEY = "avatar-recently-saved";
const COOLDOWN_MS = 10_000; // 10 seconds

/** Mark that the user just saved a new avatar. */
export async function markAvatarRecentlySaved(): Promise<void> {
    await AsyncStorage.setItem(AVATAR_SAVE_COOLDOWN_KEY, Date.now().toString());
}

/** Returns true if an avatar was saved within the last 10 seconds. */
export async function isAvatarRecentlySaved(): Promise<boolean> {
    try {
        const timestamp = await AsyncStorage.getItem(AVATAR_SAVE_COOLDOWN_KEY);
        if (!timestamp) return false;
        return Date.now() - parseInt(timestamp, 10) < COOLDOWN_MS;
    } catch {
        return false;
    }
}
