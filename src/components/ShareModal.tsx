import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import {
  X,
  Flame,
  Trophy,
  Share2,
} from "lucide-react-native";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  type: "streak" | "achievement";
  streakCount?: number;
  longestStreak?: number;
  achievementTitle?: string;
  achievementDescription?: string;
  userName?: string;
}

export function ShareModal({
  visible,
  onClose,
  type,
  streakCount = 0,
  longestStreak = 0,
  achievementTitle,
  achievementDescription,
  userName,
}: ShareModalProps) {
  const [sharing, setSharing] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    if (!viewShotRef.current) return;

    setSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Capture the view as an image
      const uri = await viewShotRef.current.capture?.();

      if (uri) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: type === "streak" ? "Share Your Streak" : "Share Your Achievement",
          });
        }
      }
    } catch {
      // Sharing failed - silently ignore
    } finally {
      setSharing(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const getStreakEmoji = () => {
    if (streakCount >= 30) return "🔥🔥🔥🔥";
    if (streakCount >= 14) return "🔥🔥🔥";
    if (streakCount >= 7) return "🔥🔥";
    return "🔥";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="flex-1" onPress={handleClose} />

        <View className="bg-cream rounded-t-3xl">
          {/* Handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="px-5 pb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-sage-900">
              Share Your {type === "streak" ? "Streak" : "Achievement"}
            </Text>
            <Pressable
              onPress={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <X size={18} color="#666" />
            </Pressable>
          </View>

          {/* Shareable Card Preview */}
          <View className="mx-5 mb-5">
            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 1 }}
            >
              <View className="overflow-hidden rounded-3xl">
                {type === "streak" ? (
                  // Streak Card - Zen Luxury Design
                  <LinearGradient
                    colors={["#faf9f7", "#f5f4f0", "#e8ebe3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 32 }}
                  >
                    {/* Subtle decorative elements */}
                    <View
                      style={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        backgroundColor: "rgba(119, 139, 95, 0.08)",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: -50,
                        left: -50,
                        width: 160,
                        height: 160,
                        borderRadius: 80,
                        backgroundColor: "rgba(119, 139, 95, 0.05)",
                      }}
                    />

                    {/* Brand Mark */}
                    <Text
                      className="text-xs text-sage-400 uppercase mb-8"
                      style={{ letterSpacing: 4 }}
                    >
                      alma wellness
                    </Text>

                    {/* Main Content */}
                    <View className="items-center py-8">
                      {/* Elegant flame icon */}
                      <View className="w-14 h-14 rounded-full bg-sage-100 items-center justify-center">
                        <Flame size={28} color="#778b5f" />
                      </View>

                      <Text
                        className="text-7xl font-light text-sage-900 mt-6"
                        style={{ letterSpacing: -2 }}
                      >
                        {streakCount}
                      </Text>
                      <Text
                        className="text-lg font-light text-sage-600 mt-2 uppercase"
                        style={{ letterSpacing: 3 }}
                      >
                        day streak
                      </Text>

                      {userName && (
                        <View className="mt-6">
                          <Text className="text-sage-500 text-sm">
                            {userName}
                          </Text>
                        </View>
                      )}

                      {longestStreak > 0 && longestStreak !== streakCount && (
                        <Text className="text-sage-400 text-xs mt-4 uppercase" style={{ letterSpacing: 2 }}>
                          Best: {longestStreak} days
                        </Text>
                      )}
                    </View>

                    {/* Footer Message */}
                    <View className="mt-6 pt-6 border-t border-sage-200/50">
                      <Text
                        className="text-center text-sage-400 text-xs uppercase"
                        style={{ letterSpacing: 2 }}
                      >
                        Nurturing wellness daily
                      </Text>
                    </View>
                  </LinearGradient>
                ) : (
                  // Achievement Card - Zen Luxury Design
                  <LinearGradient
                    colors={["#faf9f7", "#f5f4f0", "#e8ebe3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 32 }}
                  >
                    {/* Subtle decorative elements */}
                    <View
                      style={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        backgroundColor: "rgba(119, 139, 95, 0.08)",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: -50,
                        left: -50,
                        width: 160,
                        height: 160,
                        borderRadius: 80,
                        backgroundColor: "rgba(119, 139, 95, 0.05)",
                      }}
                    />

                    {/* Brand Mark */}
                    <Text
                      className="text-xs text-sage-400 uppercase mb-8"
                      style={{ letterSpacing: 4 }}
                    >
                      alma wellness
                    </Text>

                    {/* Main Content */}
                    <View className="items-center py-8">
                      {/* Elegant trophy icon */}
                      <View className="w-16 h-16 rounded-full bg-sage-100 items-center justify-center">
                        <Trophy size={32} color="#778b5f" />
                      </View>

                      <Text
                        className="text-2xl font-light text-sage-900 mt-6 text-center uppercase"
                        style={{ letterSpacing: 2 }}
                      >
                        {achievementTitle}
                      </Text>
                      <Text className="text-sm text-sage-500 mt-3 text-center font-light">
                        {achievementDescription}
                      </Text>

                      {userName && (
                        <View className="mt-6">
                          <Text
                            className="text-sage-400 text-xs uppercase"
                            style={{ letterSpacing: 2 }}
                          >
                            Unlocked by {userName}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Footer Message */}
                    <View className="mt-6 pt-6 border-t border-sage-200/50">
                      <Text
                        className="text-center text-sage-400 text-xs uppercase"
                        style={{ letterSpacing: 2 }}
                      >
                        Achievement unlocked
                      </Text>
                    </View>
                  </LinearGradient>
                )}
              </View>
            </ViewShot>
          </View>

          {/* Share Button */}
          <View className="px-5 pb-8">
            <Pressable
              onPress={handleShare}
              disabled={sharing}
              className="bg-sage-500 rounded-2xl py-4 flex-row items-center justify-center active:bg-sage-600"
            >
              {sharing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Share2 size={20} color="white" />
                  <Text className="text-white font-semibold ml-2 text-base">
                    Share Image
                  </Text>
                </>
              )}
            </Pressable>

            <Text className="text-center text-sage-400 text-xs mt-3">
              Share to Instagram, Messages, or save to your photos
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
