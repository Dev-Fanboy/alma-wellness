import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, Pressable, Modal, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  User,
  Trophy,
  TrendingUp,
  Flower2,
  ChevronRight,
  Bell,
  HelpCircle,
  Flame,
  Droplets,
  Brain,
  Footprints,
  BookHeart,
  Pencil,
  RotateCcw,
  Trash2,
  Share2,
  CreditCard,
  Sparkles,
  Volume2,
  Download,
  LogIn,
  LogOut,
  X,
  Calendar,
} from "lucide-react-native";
import { useWellnessStore, Achievement } from "@/lib/store";
import { Plant } from "@/components/Plant";
import { ShareModal } from "@/components/ShareModal";
import { soundManager, playTap, playChime } from "@/lib/sounds";
import { useAuth } from "@/lib/AuthContext";
import { isAvatarValid } from "@/lib/avatarUtils";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size: number; color: string }>
> = {
  Flower2,
  Droplets,
  Brain,
  Footprints,
  Flame,
  BookHeart,
  Trophy,
};

export default function ProfileScreen() {
  const userName = useWellnessStore((s) => s.userName);
  const userAvatar = useWellnessStore((s) => s.userAvatar);
  const plantLevel = useWellnessStore((s) => s.plantLevel);
  const plantStage = useWellnessStore((s) => s.plantStage);
  const plantPoints = useWellnessStore((s) => s.plantPoints);
  const dailyHistory = useWellnessStore((s) => s.dailyHistory);
  const currentStreak = useWellnessStore((s) => s.currentStreak);
  const longestStreak = useWellnessStore((s) => s.longestStreak);
  const achievements = useWellnessStore((s) => s.achievements);
  const resetOnboarding = useWellnessStore((s) => s.resetOnboarding);
  const resetAllData = useWellnessStore((s) => s.resetAllData);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    day: string;
    fullDayName: string;
    goalsCompleted: number;
    totalGoals: number;
    pointsEarned: number;
    isToday: boolean;
  } | null>(null);

  // Auth state
  const { user, signOut } = useAuth();

  // Initialize sound manager and get current state
  useEffect(() => {
    const initSounds = async () => {
      await soundManager.init();
      setSoundsEnabled(soundManager.getEnabled());
    };
    initSounds();
  }, []);

  // Validate avatar file on mount and when it changes
  useEffect(() => {
    const validateAvatar = async () => {
      if (userAvatar) {
        const valid = await isAvatarValid(userAvatar);
        setAvatarError(!valid);
      }
    };
    validateAvatar();
  }, [userAvatar]);

  const handleSoundToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSoundsEnabled(value);
    await soundManager.setEnabled(value);
    if (value) {
      playChime(); // Play a sound to confirm sounds are on
    }
  };

  // Shimmer animation for membership button
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * 300 - 50 }],
  }));

  const totalGoalsCompleted = dailyHistory.reduce(
    (acc, d) => acc + d.goalsCompleted,
    0
  );

  const handleNotificationSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/notification-settings");
  };

  const handleResetOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetOnboarding();
  };

  const handleHelpSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/help");
  };

  const handleResetPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResetModal(false);
    resetAllData();
    router.replace("/onboarding");
  };

  const handleCancelReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowResetModal(false);
  };

  const handleExportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/export-data");
  };

  const MENU_ITEMS = [
    {
      icon: Bell,
      label: "Notifications",
      sublabel: "Manage reminders",
      onPress: handleNotificationSettings,
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      sublabel: "FAQs, contact us",
      onPress: handleHelpSupport,
    },
    {
      icon: Download,
      label: "Export Data",
      sublabel: "Download your wellness history",
      onPress: handleExportData,
    },
    {
      icon: RotateCcw,
      label: "Reset Onboarding",
      sublabel: "View welcome screens again",
      onPress: handleResetOnboarding,
    },
  ];

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/edit-profile");
  };

  const handleMembershipPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/membership");
  };

  const handleShareAchievement = (achievement: Achievement) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAchievement(achievement);
    setShareModalVisible(true);
  };

  const renderAchievement = (achievement: Achievement) => {
    const Icon = ICON_MAP[achievement.icon] || Trophy;
    const isUnlocked = achievement.progress >= achievement.requirement;
    const progressPercent = Math.min(
      (achievement.progress / achievement.requirement) * 100,
      100
    );

    return (
      <Pressable
        key={achievement.id}
        onPress={() => isUnlocked && handleShareAchievement(achievement)}
        className={`mr-3 p-4 rounded-2xl w-40 ${isUnlocked ? "bg-sage-500" : "bg-white"
          }`}
      >
        <View className="flex-row items-start justify-between">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${isUnlocked ? "bg-white/20" : "bg-sage-100"
              }`}
          >
            <Icon size={20} color={isUnlocked ? "white" : "#b5c1a5"} />
          </View>
          {isUnlocked && (
            <View className="w-7 h-7 rounded-full bg-white/20 items-center justify-center">
              <Share2 size={14} color="white" />
            </View>
          )}
        </View>
        <Text
          className={`text-sm font-semibold mt-2 ${isUnlocked ? "text-white" : "text-sage-900"
            }`}
        >
          {achievement.title}
        </Text>
        <Text
          className={`text-xs mt-1 ${isUnlocked ? "text-sage-100" : "text-sage-500"
            }`}
        >
          {achievement.description}
        </Text>

        {/* Progress bar */}
        {!isUnlocked && (
          <View className="mt-2">
            <View className="h-1.5 bg-sage-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-sage-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
            <Text className="text-xs text-sage-400 mt-1">
              {achievement.progress}/{achievement.requirement}
            </Text>
          </View>
        )}

        {isUnlocked && (
          <Text className="text-xs text-white/70 mt-2">
            Tap to share
          </Text>
        )}
      </Pressable>
    );
  };

  // Get the current week's data for the calendar
  const getWeekData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return ["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().split("T")[0];

      const historyEntry = dailyHistory.find((h) => h.date === dateStr);
      const isToday = dateStr === today.toISOString().split("T")[0];
      const isPast = date < today && !isToday;

      const fullDayName = date.toLocaleDateString("en-US", { weekday: "long" });

      return {
        day,
        fullDayName,
        isToday,
        hasData: !!historyEntry,
        goalsCompleted: historyEntry?.goalsCompleted ?? 0,
        totalGoals: historyEntry?.totalGoals ?? 0,
        isPast,
        fullDate: dateStr,
      };
    });
  };

  const handleDayPress = (data: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Find full history entry to get points
    const historyEntry = dailyHistory.find((h) => h.date === data.fullDate);

    setSelectedDay({
      date: data.fullDate,
      day: data.day,
      fullDayName: data.fullDayName,
      goalsCompleted: data.goalsCompleted,
      totalGoals: data.totalGoals,
      pointsEarned: historyEntry?.pointsEarned || 0,
      isToday: data.isToday,
    });
  };

  const weekData = getWeekData();

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#d4dac9", "#e8ebe3", "#fdfbf7"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 300,
        }}
      />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className="px-5 pt-2"
          >
            <Text className="text-2xl font-bold text-sage-900">Profile</Text>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-5 mt-4 bg-white rounded-3xl p-5 shadow-sm"
          >
            <Pressable
              onPress={handleEditProfile}
              className="flex-row items-center"
            >
              <View className="relative">
                {avatarError || !userAvatar ? (
                  <View className="w-20 h-20 rounded-full bg-sage-200 items-center justify-center">
                    <Text className="text-2xl font-bold text-sage-600">
                      {userName ? userName.charAt(0).toUpperCase() : "?"}
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: userAvatar }}
                    className="w-20 h-20 rounded-full"
                    onError={() => setAvatarError(true)}
                  />
                )}
                <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-sage-500 items-center justify-center border-2 border-white">
                  <Pencil size={12} color="white" />
                </View>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xl font-bold text-sage-900">
                  {userName || "Add your name"}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Flower2 size={14} color="#778b5f" />
                  <Text className="text-sm text-sage-600 ml-1">
                    Level {plantLevel} Gardener
                  </Text>
                </View>
              </View>
              <View className="items-center">
                <Plant stage={plantStage} level={plantLevel} size={60} />
              </View>
            </Pressable>

            {/* Stats */}
            <View className="flex-row mt-5 pt-5 border-t border-sage-100">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-sage-700">
                  {plantPoints}
                </Text>
                <Text className="text-xs text-sage-500 mt-1">Total Points</Text>
              </View>
              <View className="w-px bg-sage-100" />
              <View className="flex-1 items-center">
                <View className="flex-row items-center">
                  <Flame size={18} color="#f97316" />
                  <Text className="text-2xl font-bold text-sage-700 ml-1">
                    {currentStreak}
                  </Text>
                </View>
                <Text className="text-xs text-sage-500 mt-1">Day Streak</Text>
              </View>
              <View className="w-px bg-sage-100" />
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-sage-700">
                  {totalGoalsCompleted}
                </Text>
                <Text className="text-xs text-sage-500 mt-1">Goals Done</Text>
              </View>
            </View>

            {/* Longest Streak Badge */}
            {longestStreak > 0 && (
              <View className="mt-4 pt-4 border-t border-sage-100 flex-row items-center justify-center">
                <Flame size={14} color="#f97316" />
                <Text className="text-sm text-sage-600 ml-1">
                  Longest streak: {longestStreak} days
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Membership Card Button - Special Premium Design */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(600)}
            className="mx-5 mt-5"
          >
            <Pressable
              onPress={handleMembershipPress}
              className="overflow-hidden rounded-2xl active:scale-[0.98]"
              style={{ transform: [{ scale: 1 }] }}
            >
              <LinearGradient
                colors={["#2d3a29", "#3d4a38", "#2d3a29"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(148, 166, 126, 0.3)",
                }}
              >
                {/* Shimmer effect */}
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      overflow: "hidden",
                      borderRadius: 16,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      shimmerStyle,
                      {
                        width: 50,
                        height: "200%",
                        backgroundColor: "rgba(255,255,255,0.08)",
                        transform: [{ rotate: "25deg" }],
                      },
                    ]}
                  />
                </Animated.View>

                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-xl bg-sage-500/30 items-center justify-center mr-4">
                    <CreditCard size={24} color="#94a67e" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white font-bold text-base">
                        Wellness Membership
                      </Text>
                      <View className="ml-2 flex-row items-center bg-amber-500/20 px-2 py-0.5 rounded-full">
                        <Sparkles size={10} color="#f59e0b" />
                        <Text className="text-amber-400 text-xs font-semibold ml-1">
                          VIP
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sage-300/70 text-xs mt-0.5">
                      Discounts at spa, gym, hotels & more
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#94a67e" />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Achievements */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="px-5 mt-6"
          >
            <View className="flex-row items-center mb-3">
              <Trophy size={20} color="#778b5f" />
              <Text className="ml-2 text-lg font-semibold text-sage-900">
                Achievements
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              {achievements.map(renderAchievement)}
            </ScrollView>
          </Animated.View>

          {/* Weekly Progress */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="px-5 mt-6"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <TrendingUp size={20} color="#778b5f" />
                <Text className="ml-2 text-lg font-semibold text-sage-900">
                  This Week
                </Text>
              </View>
              <Text className="text-xs text-sage-400">
                Tap day for details
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4">
              <View className="flex-row justify-between">
                {weekData.map((data, index) => (
                  <Pressable
                    key={index}
                    className="items-center"
                    onPress={() => handleDayPress(data)}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${data.isToday
                        ? "bg-sage-500"
                        : data.hasData && data.goalsCompleted > 0
                          ? "bg-sage-300"
                          : data.isPast
                            ? "bg-sage-100"
                            : "bg-sage-50"
                        }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${data.isToday
                          ? "text-white"
                          : data.hasData && data.goalsCompleted > 0
                            ? "text-sage-800"
                            : "text-sage-400"
                          }`}
                      >
                        {data.day}
                      </Text>
                    </View>
                    {data.hasData && data.goalsCompleted > 0 && (
                      <Text className="text-xs text-sage-500 mt-1">
                        {data.goalsCompleted}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Settings Menu */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="px-5 mt-6"
          >
            <Text className="text-lg font-semibold text-sage-900 mb-3">
              Settings
            </Text>

            <View className="bg-white rounded-2xl overflow-hidden">
              {/* Edit Profile Item */}
              <Pressable
                onPress={handleEditProfile}
                className="flex-row items-center p-4 border-b border-sage-50"
              >
                <View className="w-10 h-10 rounded-full bg-sage-50 items-center justify-center">
                  <User size={20} color="#778b5f" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-medium text-sage-900">
                    Edit Profile
                  </Text>
                  <Text className="text-xs text-sage-500">
                    Name, photo
                  </Text>
                </View>
                <ChevronRight size={20} color="#b5c1a5" />
              </Pressable>

              {MENU_ITEMS.map((item, index) => (
                <Pressable
                  key={item.label}
                  onPress={item.onPress}
                  className="flex-row items-center p-4 border-b border-sage-50"
                >
                  <View className="w-10 h-10 rounded-full bg-sage-50 items-center justify-center">
                    <item.icon size={20} color="#778b5f" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-medium text-sage-900">
                      {item.label}
                    </Text>
                    <Text className="text-xs text-sage-500">
                      {item.sublabel}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#b5c1a5" />
                </Pressable>
              ))}

              {/* Sound Effects Toggle */}
              <View className="flex-row items-center p-4 border-b border-sage-50">
                <View className="w-10 h-10 rounded-full bg-sage-50 items-center justify-center">
                  <Volume2 size={20} color="#778b5f" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-medium text-sage-900">
                    Sound Effects
                  </Text>
                  <Text className="text-xs text-sage-500">
                    Spa-like sounds for interactions
                  </Text>
                </View>
                <Switch
                  value={soundsEnabled}
                  onValueChange={handleSoundToggle}
                  trackColor={{ false: "#d4dac9", true: "#94a67e" }}
                  thumbColor={soundsEnabled ? "#ffffff" : "#f4f3f4"}
                />
              </View>

              {/* Sign In / Sign Out Button */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playTap();
                  if (user) {
                    setShowSignOutModal(true);
                  } else {
                    router.push("/auth");
                  }
                }}
                className="flex-row items-center p-4 border-b border-sage-50"
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center ${user ? "bg-amber-50" : "bg-sage-50"}`}>
                  {user ? (
                    <LogOut size={20} color="#d97706" />
                  ) : (
                    <LogIn size={20} color="#778b5f" />
                  )}
                </View>
                <View className="flex-1 ml-3">
                  <Text className={`text-base font-medium ${user ? "text-amber-600" : "text-sage-900"}`}>
                    {user ? "Sign Out" : "Sign In"}
                  </Text>
                  <Text className="text-xs text-sage-500">
                    {user ? user.email : "Sync your progress to the cloud"}
                  </Text>
                </View>
                <ChevronRight size={20} color={user ? "#fbbf24" : "#b5c1a5"} />
              </Pressable>

              {/* Reset App Data Button */}
              <Pressable
                onPress={handleResetPress}
                className="flex-row items-center p-4"
              >
                <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
                  <Trash2 size={20} color="#ef4444" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-medium text-red-500">
                    Reset All Data
                  </Text>
                  <Text className="text-xs text-sage-500">
                    Clear all progress and start fresh
                  </Text>
                </View>
                <ChevronRight size={20} color="#fca5a5" />
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Reset Confirmation Modal */}
      <Modal visible={showResetModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-cream rounded-3xl p-6 w-full max-w-sm">
            <View className="items-center mb-5">
              <View className="w-16 h-16 rounded-2xl bg-red-50 items-center justify-center mb-3">
                <Trash2 size={32} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-sage-900 text-center">
                Reset All Data?
              </Text>
              <Text className="text-sm text-sage-600 text-center mt-2">
                This will delete all your progress, goals, journal entries, and
                achievements. This action cannot be undone.
              </Text>
            </View>

            <View className="flex-row mt-2">
              <Pressable
                onPress={handleCancelReset}
                className="flex-1 py-3 mr-2 rounded-xl bg-sage-100"
              >
                <Text className="text-sage-700 font-semibold text-center">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmReset}
                className="flex-1 py-3 ml-2 rounded-xl bg-red-500"
              >
                <Text className="text-white font-semibold text-center">
                  Reset
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <Modal visible={showSignOutModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-cream rounded-3xl p-6 w-full max-w-sm">
            <View className="items-center mb-5">
              <View className="w-16 h-16 rounded-2xl bg-amber-50 items-center justify-center mb-3">
                <LogOut size={32} color="#d97706" />
              </View>
              <Text className="text-xl font-bold text-sage-900 text-center">
                Sign Out?
              </Text>
              <Text className="text-sm text-sage-600 text-center mt-2">
                Your progress is saved to the cloud. You can sign back in anytime to continue your wellness journey.
              </Text>
            </View>

            <View className="flex-row mt-2">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowSignOutModal(false);
                }}
                className="flex-1 py-3 mr-2 rounded-xl bg-sage-100"
              >
                <Text className="text-sage-700 font-semibold text-center">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setShowSignOutModal(false);
                  try {
                    await signOut();
                    router.replace("/auth");
                  } catch (error) {
                    console.error("Sign out error:", error);
                  }
                }}
                className="flex-1 py-3 ml-2 rounded-xl bg-amber-500"
              >
                <Text className="text-white font-semibold text-center">
                  Sign Out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Achievement Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => {
          setShareModalVisible(false);
          setSelectedAchievement(null);
        }}
        type="achievement"
        achievementTitle={selectedAchievement?.title}
        achievementDescription={selectedAchievement?.description}
        userName={userName}
        streakCount={currentStreak}
        longestStreak={longestStreak}
      />
      {/* Day Summary Modal */}
      <Modal
        visible={!!selectedDay}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-4"
          onPress={() => setSelectedDay(null)}
        >
          <Pressable
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl relative"
            onPress={(e) => e.stopPropagation()}
          >
            <Pressable
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-sage-50 items-center justify-center z-10"
              onPress={() => setSelectedDay(null)}
              hitSlop={8}
            >
              <X size={16} color="#778b5f" />
            </Pressable>

            <View className="items-center mb-6">
              <View className="w-12 h-12 rounded-full bg-sage-100 items-center justify-center mb-3">
                <Calendar size={24} color="#5c6e4a" />
              </View>
              <Text className="text-xl font-bold text-sage-900">
                Summary
              </Text>
              <Text className="text-sage-500 text-sm mt-1">
                {selectedDay?.fullDayName} • {selectedDay?.date}
              </Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between bg-sage-50 rounded-2xl p-4 mb-3">
                <View className="flex-row items-center">
                  <Trophy size={20} color="#eab308" />
                  <Text className="text-sage-700 font-semibold ml-3">Goals Completed</Text>
                </View>
                <Text className="text-xl font-bold text-sage-900">
                  {selectedDay?.goalsCompleted}/{selectedDay?.totalGoals}
                </Text>
              </View>

              <View className="flex-row items-center justify-between bg-sage-50 rounded-2xl p-4">
                <View className="flex-row items-center">
                  <Sparkles size={20} color="#778b5f" />
                  <Text className="text-sage-700 font-semibold ml-3">Points Earned</Text>
                </View>
                <Text className="text-xl font-bold text-sage-900">
                  +{selectedDay?.pointsEarned || 0} XP
                </Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
