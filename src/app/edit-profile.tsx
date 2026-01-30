import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Camera, Check, User, ImagePlus, Palette } from "lucide-react-native";
import { useWellnessStore } from "@/lib/store";
import { updateProfile } from "@/lib/api/profile";
import { useAuth } from "@/lib/AuthContext";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userName = useWellnessStore((s) => s.userName);
  const userAvatar = useWellnessStore((s) => s.userAvatar);
  const setUserName = useWellnessStore((s) => s.setUserName);
  const setUserAvatar = useWellnessStore((s) => s.setUserAvatar);

  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState(userAvatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const hasChanges = name !== userName || avatar !== userAvatar;

  const pickImageFromLibrary = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload a profile picture."
        );
        return;
      }

      setIsUploading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        setShowAvatarPicker(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to take a profile picture."
        );
        return;
      }

      setIsUploading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        setShowAvatarPicker(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Update local state
    if (name !== userName) {
      setUserName(name.trim());
    }
    if (avatar !== userAvatar) {
      setUserAvatar(avatar);
    }

    // Sync to cloud if authenticated
    if (user) {
      await updateProfile({
        name: name.trim(),
        avatar_url: avatar,
      });
    }

    router.back();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#d4dac9", "#e8ebe3", "#fdfbf7"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 250 }}
      />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white/60 items-center justify-center"
            >
              <ArrowLeft size={20} color="#49573c" />
            </Pressable>
            <Text className="text-lg font-semibold text-sage-900">
              Edit Profile
            </Text>
            <Pressable
              onPress={handleSave}
              disabled={!hasChanges || !name.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${hasChanges && name.trim() ? "bg-sage-500" : "bg-sage-200"
                }`}
            >
              <Check size={20} color="white" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <Animated.View
              entering={FadeInUp.delay(100).duration(500)}
              className="items-center mt-4"
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAvatarPicker(!showAvatarPicker);
                }}
                className="relative"
              >
                <Image
                  source={{ uri: avatar }}
                  className="w-28 h-28 rounded-full"
                />
                <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-sage-500 items-center justify-center border-3 border-cream">
                  <Camera size={16} color="white" />
                </View>
              </Pressable>
              <Text className="text-sage-500 text-sm mt-2">
                Tap to change photo
              </Text>
            </Animated.View>

            {/* Avatar Picker */}
            {showAvatarPicker && (
              <Animated.View
                entering={FadeInUp.duration(300)}
                className="mx-5 mt-4 bg-white rounded-2xl p-4"
              >
                {/* Upload Options */}
                <Text className="text-sage-700 font-medium mb-3">
                  Upload a photo
                </Text>
                <View className="flex-row mb-4">
                  <Pressable
                    onPress={pickImageFromLibrary}
                    disabled={isUploading}
                    className="flex-1 mr-2 bg-sage-50 rounded-xl p-4 items-center"
                  >
                    <View className="w-12 h-12 rounded-full bg-sage-100 items-center justify-center mb-2">
                      <ImagePlus size={24} color="#5c6e4a" />
                    </View>
                    <Text className="text-sage-700 font-medium text-sm">Photo Library</Text>
                  </Pressable>
                  <Pressable
                    onPress={takePhoto}
                    disabled={isUploading}
                    className="flex-1 ml-2 bg-sage-50 rounded-xl p-4 items-center"
                  >
                    <View className="w-12 h-12 rounded-full bg-sage-100 items-center justify-center mb-2">
                      <Camera size={24} color="#5c6e4a" />
                    </View>
                    <Text className="text-sage-700 font-medium text-sm">Take Photo</Text>
                  </Pressable>
                </View>

                {/* Divider */}
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-px bg-sage-200" />
                  <View className="flex-row items-center px-3">
                    <Palette size={14} color="#94a67e" />
                    <Text className="text-sage-400 text-xs ml-1">or choose an avatar</Text>
                  </View>
                  <View className="flex-1 h-px bg-sage-200" />
                </View>

                {/* Preset Avatars */}
                <View className="flex-row flex-wrap">
                  {AVATAR_OPTIONS.map((avatarUrl, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setAvatar(avatarUrl);
                        setShowAvatarPicker(false);
                      }}
                      className="w-1/4 p-1"
                    >
                      <Image
                        source={{ uri: avatarUrl }}
                        className={`w-full aspect-square rounded-full ${avatar === avatarUrl
                          ? "border-3 border-sage-500"
                          : "border-2 border-sage-100"
                          }`}
                      />
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Name Input */}
            <Animated.View
              entering={FadeInUp.delay(200).duration(500)}
              className="mx-5 mt-6"
            >
              <Text className="text-sage-700 font-medium mb-2">Name</Text>
              <View className="bg-white rounded-2xl">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#b5c1a5"
                  selectionColor="#5c6e4a"
                  className="px-4 py-4 text-base text-sage-900"
                  maxLength={30}
                />
              </View>
              <Text className="text-sage-400 text-xs mt-1 text-right">
                {name.length}/30
              </Text>
            </Animated.View>

            {/* Info Card */}
            <Animated.View
              entering={FadeInUp.delay(300).duration(500)}
              className="mx-5 mt-6 bg-sage-100 rounded-2xl p-4"
            >
              <View className="flex-row items-center">
                <User size={20} color="#5c6e4a" />
                <Text className="ml-2 text-sage-700 font-medium">
                  Profile Privacy
                </Text>
              </View>
              <Text className="text-sage-600 text-sm mt-2 leading-relaxed">
                Your name and photo are visible to friends in your garden
                circle. You can change these anytime.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
