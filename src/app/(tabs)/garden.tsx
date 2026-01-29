import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Modal,
  Share,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import {
  Users,
  Flower2,
  UserPlus,
  Share2,
  Copy,
  Check,
  X,
  Trophy,
  Flame,
  TrendingUp,
  Sparkles,
  CloudRain,
  Droplet,
  Heart,
  Target,
} from "lucide-react-native";
import { useWellnessStore, Friend } from "@/lib/store";
import { Plant } from "@/components/Plant";
import { playWaterDrop, playSuccess, playTap } from "@/lib/sounds";
import { useFriends } from "@/lib/hooks/useFriends";
import { useAuth } from "@/lib/AuthContext";
import { sendNudge as sendNudgeApi } from "@/lib/api/nudges";

// Weekly target for the grove
const WEEKLY_TARGET_XP = 2500;

export default function GardenScreen() {
  const localFriends = useWellnessStore((s) => s.friends);
  const userName = useWellnessStore((s) => s.userName);
  const userAvatar = useWellnessStore((s) => s.userAvatar);
  const plantLevel = useWellnessStore((s) => s.plantLevel);
  const plantPoints = useWellnessStore((s) => s.plantPoints);
  const currentStreak = useWellnessStore((s) => s.currentStreak);
  const inviteCode = useWellnessStore((s) => s.inviteCode);
  const removeFriendLocal = useWellnessStore((s) => s.removeFriend);

  // Cloud friends hook
  const { user } = useAuth();
  const {
    friends: cloudFriends,
    pendingRequests,
    isAuthenticated,
    addFriendByCode,
    acceptRequest,
    rejectRequest,
    removeFriend: removeFriendCloud,
    loading: friendsLoading
  } = useFriends();

  // Use cloud friends if authenticated, otherwise use demo friends
  const friends = isAuthenticated
    ? cloudFriends.map(f => ({
      id: f.id,
      name: f.name,
      avatar: f.avatar_url,
      plantLevel: f.plant_level,
      totalPoints: f.plant_points,
      weeklyPoints: f.weeklyPoints,
      currentStreak: f.current_streak,
      isOnline: f.isOnline,
      lastActive: f.lastActive,
    }))
    : localFriends;

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nudgedUsers, setNudgedUsers] = useState<Set<string>>(new Set());

  // Auto-hide toast message
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Calculate weekly points for user
  const userWeeklyPoints = Math.floor(plantPoints * 0.15);

  // Create user member object
  const userMember = {
    id: user?.id || "user",
    name: userName || "You",
    avatar: userAvatar,
    plantLevel,
    totalPoints: plantPoints,
    weeklyPoints: userWeeklyPoints,
    currentStreak,
    isOnline: true,
    isUser: true,
    lastActive: 0, // User is always active
  };

  const allMembers = [
    userMember,
    ...friends.map((f) => ({ ...f, isUser: false })),
  ];

  // Calculate total group XP for the week
  const totalGroupXP = allMembers.reduce(
    (sum, member) => sum + (member.weeklyPoints ?? 0),
    0
  );
  const groveProgress = Math.min((totalGroupXP / WEEKLY_TARGET_XP) * 100, 100);
  const progressPercent = Math.round(groveProgress);

  // Sort by lastActive (ascending) - people who need help at the top
  const sortedByNeed = [...allMembers].sort(
    (a, b) => (b.lastActive ?? 0) - (a.lastActive ?? 0)
  );

  // For the plant grid, keep original order but show top 6
  const gridMembers = allMembers.slice(0, 6);

  const getPlantStage = (level: number) => {
    if (level < 3) return "seed";
    if (level < 6) return "sprout";
    if (level < 10) return "growing";
    if (level < 15) return "budding";
    return "blooming";
  };

  const isWilting = (lastActive?: number) => {
    return (lastActive ?? 0) > 48;
  };

  const getLastActiveText = (hours?: number) => {
    if (hours === undefined || hours === 0) return "Active now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleInvite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowInviteModal(true);
  };

  const handleCopyCode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Join me on Alma Wellness! Use my invite code: ${inviteCode}\n\nGrow your wellness garden together with friends.`,
      });
    } catch (error) {
      // Error handling
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCodeInput.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoinLoading(true);

    try {
      const { error } = await addFriendByCode(inviteCodeInput.trim());
      if (error) {
        setToastMessage("Could not sent request: " + error.message);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToastMessage("Friend request sent!");
        setInviteCodeInput("");
        setShowInviteModal(false);
      }
    } catch (e) {
      setToastMessage("An error occurred");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string, friendName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { error } = await acceptRequest(requestId);
    if (error) {
      setToastMessage("Failed to accept: " + error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToastMessage(`You are now friends with ${friendName}!`);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { error } = await rejectRequest(userId);
    if (error) {
      setToastMessage("Failed to reject: " + error.message);
    }
  };

  const handleFriendPress = (friend: typeof userMember | Friend) => {
    // Check if it's the user (either by isUser flag or ID match)
    const isCurrentUser = ('isUser' in friend && friend.isUser) || friend.id === user?.id;

    if (isCurrentUser) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFriend(friend);
    setShowFriendModal(true);
  };

  const handleRemoveFriend = () => {
    if (selectedFriend) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (isAuthenticated) {
        removeFriendCloud(selectedFriend.id);
      } else {
        removeFriendLocal(selectedFriend.id);
      }
      setShowRemoveConfirm(false);
      setShowFriendModal(false);
      setSelectedFriend(null);
    }
  };

  const sendNudge = useCallback(
    async (userId: string, userName: string) => {
      if (nudgedUsers.has(userId)) return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playWaterDrop(); // Play water drop sound for sending rain

      // Mark as nudged locally immediately for optimistic UI
      setNudgedUsers((prev) => new Set(prev).add(userId));

      // Show toast
      setToastMessage(`You sent rain to ${userName}! +10 XP`);
      setTimeout(() => setToastMessage(null), 2500);

      // Send to cloud
      if (isAuthenticated) {
        try {
          await sendNudgeApi(userId);
        } catch (e) {
          console.error("Failed to send nudge", e);
        }
      }
    },
    [nudgedUsers, isAuthenticated]
  );

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#d4dac9", "#e8ebe3", "#fdfbf7"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 350,
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
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Heart size={24} color="#49573c" />
                <Text className="ml-2 text-2xl font-bold text-sage-900">
                  The Garden
                </Text>
              </View>
              <Pressable
                onPress={handleInvite}
                className="w-10 h-10 rounded-full bg-sage-500 items-center justify-center"
              >
                <UserPlus size={20} color="white" />
              </Pressable>
            </View>
            <Text className="text-base text-sage-600 mt-1">
              Help your friends grow together
            </Text>
          </Animated.View>


          {/* Friend Requests Section */}
          {pendingRequests && pendingRequests.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(120).duration(500)}
              className="mx-5 mt-4 mb-2"
            >
              <Text className="text-sm font-semibold text-sage-800 mb-2">Friend Requests</Text>
              {pendingRequests.map((request) => (
                <View key={request.id} className="bg-white rounded-2xl p-3 mb-2 flex-row items-center justify-between shadow-sm">
                  <View className="flex-row items-center flex-1 mr-2">
                    <Image
                      source={{ uri: request.friend?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" }}
                      className="w-10 h-10 rounded-full bg-sage-100"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-sage-900 font-semibold" numberOfLines={1}>
                        {request.friend?.name || "Unknown"}
                      </Text>
                      <Text className="text-sage-500 text-xs">
                        Wants to join your garden
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row">
                    <Pressable
                      onPress={() => handleRejectRequest(request.friend?.id || "")}
                      className="w-9 h-9 rounded-full bg-red-50 items-center justify-center mr-2"
                    >
                      <X size={18} color="#ef4444" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleAcceptRequest(request.id, request.friend?.name || "")}
                      className="w-9 h-9 rounded-full bg-sage-500 items-center justify-center"
                    >
                      <Check size={18} color="white" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Demo Notice - only show when not authenticated or no cloud friends */}
          {/* Notice Banner */}
          {(!isAuthenticated || cloudFriends.length === 0) && (
            <Animated.View
              entering={FadeInUp.delay(120).duration(500)}
              className="mx-5 mt-3"
            >
              <View className="bg-sage-100/80 rounded-xl px-4 py-2 flex-row items-center">
                <Sparkles size={14} color="#778b5f" />
                <Text className="text-xs text-sage-600 ml-2 flex-1">
                  {isAuthenticated
                    ? "Your garden is empty. Share your invite code to add friends!"
                    : "These are example friends. Sign in to connect with real friends!"}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Grove Vitality Card */}
          <Animated.View
            entering={FadeInUp.delay(150).duration(600)}
            className="mx-5 mt-4"
          >
            <View className="bg-white rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center">
                    <Target size={20} color="#5c6e4a" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-sm text-sage-500">Grove Vitality</Text>
                    <Text className="text-base font-semibold text-sage-900">
                      Team Goal: {WEEKLY_TARGET_XP.toLocaleString()} XP
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold text-sage-700">
                    {totalGroupXP.toLocaleString()}
                  </Text>
                  <Text className="text-xs text-sage-500">XP this week</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="h-4 bg-sage-100 rounded-full overflow-hidden">
                <Animated.View
                  entering={FadeIn.delay(300).duration(800)}
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: progressPercent >= 100 ? "#5c6e4a" : "#778b5f",
                  }}
                />
              </View>
              <Text className="text-sm text-sage-600 mt-2 text-center">
                {progressPercent >= 100
                  ? "Goal reached! Amazing teamwork!"
                  : `You are ${progressPercent}% there!`}
              </Text>
            </View>
          </Animated.View>

          {/* Garden Visualization */}
          {friendsLoading ? (
            <View className="mt-8 mb-8 items-center justify-center">
              <ActivityIndicator size="large" color="#778b5f" />
              <Text className="text-sage-400 text-sm mt-3">Growing your garden...</Text>
            </View>
          ) : (
            <Animated.View
              entering={FadeInUp.delay(200).duration(800)}
              className="mt-4 mx-5"
            >
              <View className="bg-white/60 rounded-3xl p-4 shadow-sm">
                <View className="flex-row flex-wrap justify-center">
                  {gridMembers.map((member, index) => {
                    const wilting = isWilting(member.lastActive);
                    return (
                      <Pressable
                        key={member.id}
                        onPress={() => handleFriendPress(member as Friend)}
                        className="w-1/3 items-center py-2"
                      >
                        <View className="relative">
                          <View style={{ opacity: wilting ? 0.5 : 1 }}>
                            <Plant
                              stage={getPlantStage(member.plantLevel)}
                              level={member.plantLevel}
                              size={80}
                            />
                          </View>
                          {wilting && (
                            <View
                              className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center bg-sage-200"
                            >
                              <Droplet size={14} color="#94a67e" />
                            </View>
                          )}
                          {member.isOnline && !wilting && (
                            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                          )}
                        </View>
                        <Text
                          className={`text-xs font-medium mt-1 ${wilting ? "text-sage-400" : "text-sage-800"
                            }`}
                          numberOfLines={1}
                        >
                          {member.isUser ? "You" : member.name}
                        </Text>
                        <Text
                          className={`text-[10px] ${wilting ? "text-sage-300" : "text-sage-500"
                            }`}
                        >
                          Lv.{member.plantLevel}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Grove Care Section */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(600)}
            className="px-5 mt-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <CloudRain size={20} color="#778b5f" />
                <Text className="ml-2 text-xl font-bold text-sage-900">
                  Grove Care
                </Text>
              </View>
              <Text className="text-xs text-sage-500">
                Help wilting plants
              </Text>
            </View>
          </Animated.View>

          {/* Grove Care List */}
          <View className="px-5">
            {sortedByNeed.map((member, index) => {
              const wilting = isWilting(member.lastActive);
              const alreadyNudged = nudgedUsers.has(member.id);

              return (
                <Animated.View
                  key={member.id}
                  entering={FadeInUp.delay(300 + index * 50).duration(500)}
                >
                  <Pressable
                    onPress={() => !member.isUser && handleFriendPress(member as Friend)}
                    disabled={member.isUser}
                    className={`flex-row items-center p-3 mb-2 rounded-2xl ${member.isUser
                      ? "bg-sage-100"
                      : wilting
                        ? "bg-amber-50"
                        : "bg-white"
                      }`}
                  >
                    {/* Status Indicator */}
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${wilting ? "bg-amber-100" : "bg-sage-100"
                        }`}
                    >
                      {wilting ? (
                        <Droplet size={18} color="#d97706" />
                      ) : (
                        <Flower2 size={18} color="#778b5f" />
                      )}
                    </View>

                    {/* Avatar */}
                    <View className="relative ml-3">
                      <Image
                        source={{ uri: member.avatar }}
                        className="w-12 h-12 rounded-full"
                        style={{ opacity: wilting ? 0.7 : 1 }}
                      />
                      {member.isOnline && (
                        <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      )}
                    </View>

                    {/* Info */}
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <Text
                          className={`text-base font-semibold ${wilting ? "text-amber-800" : "text-sage-900"
                            }`}
                        >
                          {member.isUser ? "You" : member.name}
                        </Text>
                        {member.isUser && (
                          <View className="ml-2 bg-sage-500 rounded-full px-2 py-0.5">
                            <Text className="text-[10px] text-white font-medium">
                              YOU
                            </Text>
                          </View>
                        )}
                        {wilting && !member.isUser && (
                          <View className="ml-2 bg-amber-200 rounded-full px-2 py-0.5">
                            <Text className="text-[10px] text-amber-800 font-medium">
                              NEEDS CARE
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-xs text-sage-600">
                          {getLastActiveText(member.lastActive)}
                        </Text>
                        {(member.currentStreak ?? 0) > 0 && (
                          <>
                            <View className="w-1 h-1 bg-sage-300 rounded-full mx-2" />
                            <Flame size={12} color="#f97316" />
                            <Text className="text-xs text-sage-600 ml-1">
                              {member.currentStreak} day streak
                            </Text>
                          </>
                        )}
                      </View>
                    </View>

                    {/* Action Button or Points */}
                    {member.isUser ? (
                      <View className="items-end">
                        <Text className="text-lg font-bold text-sage-700">
                          {member.weeklyPoints ?? 0}
                        </Text>
                        <Text className="text-xs text-sage-500">XP</Text>
                      </View>
                    ) : wilting ? (
                      <Pressable
                        onPress={() => sendNudge(member.id, member.name)}
                        disabled={alreadyNudged}
                        className={`w-10 h-10 rounded-full items-center justify-center ${alreadyNudged ? "bg-sage-200" : "bg-sage-500"
                          }`}
                      >
                        <CloudRain
                          size={20}
                          color={alreadyNudged ? "#94a67e" : "white"}
                        />
                      </Pressable>
                    ) : (
                      <View className="items-end">
                        <Text className="text-lg font-bold text-sage-700">
                          {member.weeklyPoints ?? 0}
                        </Text>
                        <Text className="text-xs text-sage-500">XP</Text>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {/* Invite Friends Button */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            className="mx-5 mt-4"
          >
            <Pressable
              onPress={handleInvite}
              className="bg-sage-500 rounded-2xl p-4 flex-row items-center justify-center"
            >
              <UserPlus size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Invite Friends to Grove
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Toast Notification */}
      {
        toastMessage && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            className="absolute bottom-28 left-5 right-5"
          >
            <View className="bg-sage-800 rounded-2xl py-4 px-5 flex-row items-center justify-center">
              <CloudRain size={20} color="#d4dac9" />
              <Text className="text-cream font-medium ml-2">{toastMessage}</Text>
            </View>
          </Animated.View>
        )
      }

      {/* Invite Modal */}
      <Modal visible={showInviteModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-cream rounded-t-3xl pt-6 pb-10 px-5">
            {/* Handle */}
            <View className="w-10 h-1 bg-sage-300 rounded-full self-center mb-6" />

            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-sage-900">
                Invite Friends
              </Text>
              <Pressable
                onPress={() => setShowInviteModal(false)}
                className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
              >
                <X size={20} color="#49573c" />
              </Pressable>
            </View>

            {/* Illustration */}
            <View className="items-center mb-6">
              <View className="flex-row items-end">
                <Plant stage="sprout" level={3} size={60} />
                <Plant stage="growing" level={8} size={80} />
                <Plant stage="blooming" level={15} size={70} />
              </View>
              <Text className="text-sage-600 text-center mt-4">
                Grow together and help each other thrive in the cooperative
                grove!
              </Text>
            </View>

            {/* Invite Code */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-sm text-sage-500 mb-2">
                Your invite code
              </Text>
              <View className="flex-row items-center">
                <View className="flex-1 bg-sage-50 rounded-xl px-4 py-3">
                  <Text className="text-xl font-bold text-sage-800 text-center tracking-widest">
                    {inviteCode}
                  </Text>
                </View>
                <Pressable
                  onPress={handleCopyCode}
                  className={`ml-3 w-12 h-12 rounded-xl items-center justify-center ${copiedCode ? "bg-green-500" : "bg-sage-100"
                    }`}
                >
                  {copiedCode ? (
                    <Check size={20} color="white" />
                  ) : (
                    <Copy size={20} color="#5c6e4a" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Share Button */}
            <Pressable
              onPress={handleShare}
              className="bg-sage-600 rounded-2xl py-4 flex-row items-center justify-center"
            >
              <Share2 size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Share Invite Link
              </Text>
            </Pressable>

            {/* Join with code */}
            <View className="mt-6">
              <Text className="text-sm text-sage-500 mb-2 text-center">
                Have an invite code?
              </Text>
              <View className="flex-row">
                <TextInput
                  placeholder="Enter friend's code"
                  placeholderTextColor="#94a67e"
                  className="flex-1 bg-white rounded-xl px-4 py-3 text-sage-900"
                  value={inviteCodeInput}
                  onChangeText={setInviteCodeInput}
                  autoCapitalize="characters"
                />
                <Pressable
                  onPress={handleJoinWithCode}
                  disabled={joinLoading || !inviteCodeInput.trim()}
                  className={`ml-3 rounded-xl px-6 items-center justify-center ${joinLoading || !inviteCodeInput.trim() ? "bg-sage-300" : "bg-sage-500"
                    }`}
                >
                  {joinLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-semibold">Join</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Friend Profile Modal */}
      <Modal visible={showFriendModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-cream rounded-t-3xl pt-6 pb-10 px-5">
            {/* Handle */}
            <View className="w-10 h-1 bg-sage-300 rounded-full self-center mb-6" />

            {selectedFriend && (
              <>
                {/* Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-sage-900">
                    Friend Profile
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowFriendModal(false);
                      setSelectedFriend(null);
                    }}
                    className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
                  >
                    <X size={20} color="#49573c" />
                  </Pressable>
                </View>

                {/* Profile Card */}
                <View className="bg-white rounded-2xl p-5 mb-4">
                  <View className="flex-row items-center">
                    <View className="relative">
                      <Image
                        source={{ uri: selectedFriend.avatar }}
                        className="w-20 h-20 rounded-full"
                      />
                      {selectedFriend.isOnline && (
                        <View className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                      )}
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-xl font-bold text-sage-900">
                        {selectedFriend.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Flower2 size={14} color="#778b5f" />
                        <Text className="text-sm text-sage-600 ml-1">
                          Level {selectedFriend.plantLevel} Gardener
                        </Text>
                      </View>
                      <Text className="text-xs text-sage-400 mt-1">
                        {getLastActiveText(selectedFriend.lastActive)}
                      </Text>
                    </View>
                    <Plant
                      stage={getPlantStage(selectedFriend.plantLevel)}
                      level={selectedFriend.plantLevel}
                      size={70}
                    />
                  </View>
                </View>

                {/* Stats */}
                <View className="flex-row mb-4">
                  <View className="flex-1 bg-white rounded-2xl p-4 mr-2 items-center">
                    <Trophy size={24} color="#FFD700" />
                    <Text className="text-2xl font-bold text-sage-800 mt-2">
                      {selectedFriend.totalPoints}
                    </Text>
                    <Text className="text-xs text-sage-500">Total Points</Text>
                  </View>
                  <View className="flex-1 bg-white rounded-2xl p-4 ml-2 items-center">
                    <Flame size={24} color="#f97316" />
                    <Text className="text-2xl font-bold text-sage-800 mt-2">
                      {selectedFriend.currentStreak ?? 0}
                    </Text>
                    <Text className="text-xs text-sage-500">Day Streak</Text>
                  </View>
                </View>

                <View className="flex-row mb-6">
                  <View className="flex-1 bg-white rounded-2xl p-4 mr-2 items-center">
                    <TrendingUp size={24} color="#778b5f" />
                    <Text className="text-2xl font-bold text-sage-800 mt-2">
                      {selectedFriend.weeklyPoints ?? 0}
                    </Text>
                    <Text className="text-xs text-sage-500">This Week</Text>
                  </View>
                  <View className="flex-1 bg-white rounded-2xl p-4 ml-2 items-center">
                    <Sparkles size={24} color="#c4a7e7" />
                    <Text className="text-2xl font-bold text-sage-800 mt-2">
                      {selectedFriend.plantLevel}
                    </Text>
                    <Text className="text-xs text-sage-500">Level</Text>
                  </View>
                </View>

                {/* Send Rain Button for Wilting Friends */}
                {isWilting(selectedFriend.lastActive) &&
                  !nudgedUsers.has(selectedFriend.id) && (
                    <Pressable
                      onPress={() => {
                        sendNudge(selectedFriend.id, selectedFriend.name);
                      }}
                      className="bg-sage-500 rounded-2xl py-3 mb-3 flex-row items-center justify-center"
                    >
                      <CloudRain size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">
                        Send Rain to Help
                      </Text>
                    </Pressable>
                  )}

                {/* Remove Friend Button */}
                {!showRemoveConfirm ? (
                  <Pressable
                    onPress={() => setShowRemoveConfirm(true)}
                    className="border border-red-300 rounded-2xl py-3"
                  >
                    <Text className="text-red-500 font-medium text-center">
                      Remove Friend
                    </Text>
                  </Pressable>
                ) : (
                  <View className="bg-red-50 rounded-2xl p-4">
                    <Text className="text-red-600 text-center mb-3">
                      Remove {selectedFriend.name} from your grove?
                    </Text>
                    <View className="flex-row">
                      <Pressable
                        onPress={() => setShowRemoveConfirm(false)}
                        className="flex-1 py-3 mr-2 rounded-xl bg-sage-100"
                      >
                        <Text className="text-sage-700 font-semibold text-center">
                          Cancel
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={handleRemoveFriend}
                        className="flex-1 py-3 ml-2 rounded-xl bg-red-500"
                      >
                        <Text className="text-white font-semibold text-center">
                          Remove
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View >
  );
}
