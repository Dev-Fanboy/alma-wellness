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
import { ArrowLeft, Camera, Check, User, ImagePlus, Trash2 } from "lucide-react-native";
import { useWellnessStore } from "@/lib/store";
import { updateProfile } from "@/lib/api/profile";
import { useAuth } from "@/lib/AuthContext";
import { uploadAvatar, saveAvatarLocally, isLocalFile, isPresetAvatar, optimizeImage, markAvatarRecentlySaved } from "@/lib/avatarUtils";

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
        quality: 1, // Full quality, we'll optimize ourselves
      });

      if (!result.canceled && result.assets[0]) {
        // Optimize image immediately for better preview and faster upload
        const optimizedUri = await optimizeImage(result.assets[0].uri);
        setAvatar(optimizedUri);
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
        quality: 1, // Full quality, we'll optimize ourselves
      });

      if (!result.canceled && result.assets[0]) {
        // Optimize image immediately for better preview and faster upload
        const optimizedUri = await optimizeImage(result.assets[0].uri);
        setAvatar(optimizedUri);
        setShowAvatarPicker(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAvatar("");
    setShowAvatarPicker(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsUploading(true);

    try {
      let finalAvatarUrl = avatar;

      // Handle avatar changes
      if (avatar !== userAvatar) {
        // Check if it's a local file (from camera or library)
        if (isLocalFile(avatar) && !isPresetAvatar(avatar)) {
          // Save locally first for immediate persistence
          const localSavedUri = await saveAvatarLocally(avatar);
          if (localSavedUri) {
            finalAvatarUrl = localSavedUri;
          }

          // Upload to cloud if authenticated
          if (user) {
            const cloudUrl = await uploadAvatar(avatar);
            if (cloudUrl) {
              // Prefer cloud URL for better sync across devices
              finalAvatarUrl = cloudUrl;
            }
          }
        }
        // For preset avatars (unsplash URLs), just use directly
        setUserAvatar(finalAvatarUrl);
        // Mark as recently saved so cloud sync doesn't overwrite
        await markAvatarRecentlySaved();
      }

      // Update name
      if (name !== userName) {
        setUserName(name.trim());
      }

      // Sync to cloud if authenticated
      if (user) {
        await updateProfile({
          name: name.trim(),
          avatar_url: finalAvatarUrl,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUploading(false);
    }
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
              disabled={!hasChanges || !name.trim() || isUploading}
              className={`w-10 h-10 rounded-full items-center justify-center ${isUploading
                ? "bg-sage-400"
                : hasChanges && name.trim()
                  ? "bg-sage-500"
                  : "bg-sage-200"
                }`}
            >
              {isUploading ? (
                <Text className="text-white text-xs">...</Text>
              ) : (
                <Check size={20} color="white" />
              )}
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
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    className="w-28 h-28 rounded-full"
                  />
                ) : (
                  <View className="w-28 h-28 rounded-full bg-sage-200 items-center justify-center">
                    <User size={48} color="#94a67e" />
                  </View>
                )}
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

                {/* Remove Option - Only if avatar exists */}
                {avatar ? (
                  <Pressable
                    onPress={handleRemovePhoto}
                    disabled={isUploading}
                    className="bg-red-50 rounded-xl p-4 flex-row items-center justify-center border border-red-100"
                  >
                    <Trash2 size={20} color="#ef4444" />
                    <Text className="ml-2 text-red-500 font-medium">Remove Current Photo</Text>
                  </Pressable>
                ) : null}

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
