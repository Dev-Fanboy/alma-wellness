import React, { useState, useCallback, useEffect, useRef } from "react";
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
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import PagerView from "react-native-pager-view";
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
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trash2,
} from "lucide-react-native";
import { useWellnessStore, Friend } from "@/lib/store";
import { Plant } from "@/components/Plant";
import { playWaterDrop, playSuccess, playTap } from "@/lib/sounds";
import { useFriends } from "@/lib/hooks/useFriends";
import { useGroves, GroveDisplayMember } from "@/lib/hooks/useGroves";
import { useAuth } from "@/lib/AuthContext";
import { sendNudge as sendNudgeApi } from "@/lib/api/nudges";
import { checkAndIncrementStreak } from "@/lib/api/groves";
import { checkAndIncrementFriendsStreak } from "@/lib/api/profile";
import { WeeklyBloomCard } from "@/components/WeeklyBloomCard";
import { generateShareMessage } from "@/lib/deepLinks";
import { useFocusEffect } from "expo-router";
import { CreateGroveModal } from "@/components/CreateGroveModal";
import { GroveContent } from "@/components/GroveContent";

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
  const pendingInviteCode = useWellnessStore((s) => s.pendingInviteCode);
  const setPendingInviteCode = useWellnessStore((s) => s.setPendingInviteCode);
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
    loading: friendsLoading,
    refreshAll,
  } = useFriends();

  const [refreshing, setRefreshing] = useState(false);

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

  // Groves (custom community gardens)
  const {
    groves,
    loading: grovesLoading,
    createGrove,
    joinGrove,
    leaveGrove,
    deleteGrove,
    refreshGroves,
  } = useGroves();

  // Pager state for swipeable groves
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showCreateGroveModal, setShowCreateGroveModal] = useState(false);
  const [showBloomCard, setShowBloomCard] = useState(false);

  const SCREEN_WIDTH = Dimensions.get('window').width;

  // Calculate current view data


  // Get current streak based on page
  // For Page 0 (Friends), use user profile data (need to fetch/store in AuthContext or Profile?)
  // Currently fetching 'friends_garden_streak' is not in AuthContext user object yet unless updated.
  // Assuming user object has it or we re-fetch profile.
  // For now using 0 safeguard.


  // Check for goal met


  // Scroll to page when currentPage changes
  useEffect(() => {
    pagerRef.current?.setPage(currentPage);
  }, [currentPage]);

  // Total pages: Friends grove + custom groves
  const totalPages = 1 + groves.length;

  // Auto-hide toast message
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle pending invite codes from deep links
  useEffect(() => {
    if (pendingInviteCode) {
      // Pre-fill the invite code input and open the modal
      setInviteCodeInput(pendingInviteCode);
      setShowInviteModal(true);
      // Clear the pending code so it doesn't trigger again
      setPendingInviteCode(null);
    }
  }, [pendingInviteCode, setPendingInviteCode]);

  // Refresh friends and groves when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        refreshAll();
        refreshGroves();
      }
    }, [isAuthenticated, refreshAll, refreshGroves])
  );

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshAll(), refreshGroves()]);
    setRefreshing(false);
  }, [refreshAll, refreshGroves]);

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

  // Calculate current view data
  const currentMembers = currentPage === 0 ? allMembers : groves[currentPage - 1]?.members;
  const totalGroupXP = currentMembers?.reduce((acc, m) => acc + (m.weeklyPoints || 0), 0) || 0;

  // Get current streak based on page
  const currentGroveStreak = currentPage === 0
    ? (user as any)?.friends_garden_streak || 0
    : groves[currentPage - 1]?.current_streak || 0;

  // Check for goal met
  useEffect(() => {
    if (totalGroupXP >= WEEKLY_TARGET_XP && isAuthenticated) {
      if (currentPage === 0) {
        checkAndIncrementFriendsStreak(totalGroupXP);
      } else {
        const groveId = groves[currentPage - 1]?.id;
        if (groveId) checkAndIncrementStreak(groveId, totalGroupXP);
      }
    }
  }, [totalGroupXP, currentPage, isAuthenticated, groves]);



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
        message: generateShareMessage(inviteCode, userName),
      });
    } catch (error) {
      // Error handling
    }
  };

  const handleLeaveGrove = async (groveId: string, groveName: string) => {
    Alert.alert(
      "Leave Grove",
      `Are you sure you want to leave "${groveName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            const result = await leaveGrove(groveId);
            if (result.success) {
              setToastMessage(`Left "${groveName}"`);
              // Scroll back to Friends Grove
              setCurrentPage(0);
              pagerRef.current?.setPage(0);
            } else {
              Alert.alert("Error", result.error || "Failed to leave grove");
            }
          },
        },
      ]
    );
  };

  const handleDeleteGrove = async (groveId: string, groveName: string) => {
    Alert.alert(
      "Delete Grove",
      `Are you sure you want to delete "${groveName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteGrove(groveId);
            if (result.success) {
              setToastMessage(`Deleted "${groveName}"`);
              // Scroll back to Friends Grove
              setCurrentPage(0);
              pagerRef.current?.setPage(0);
            } else {
              Alert.alert("Error", result.error || "Failed to delete grove");
            }
          },
        },
      ]
    );
  };

  const handleJoinWithCode = async () => {
    if (!inviteCodeInput.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoinLoading(true);

    try {
      const code = inviteCodeInput.trim().toUpperCase();

      // Try joining as a grove first
      const groveResult = await joinGrove(code);
      if (groveResult.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToastMessage(`Joined "${groveResult.grove?.name}" garden!`);
        setInviteCodeInput("");
        setShowInviteModal(false);
        return;
      }

      // If not a grove, try as a friend code
      const { error } = await addFriendByCode(code);
      if (error) {
        // Show a combined error message
        setToastMessage("Invalid code. Check and try again.");
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



  const renderBloomButton = () => {
    if (totalGroupXP < WEEKLY_TARGET_XP) return null;

    return (
      <Animated.View
        entering={FadeInDown.delay(300).duration(600)}
        className="mx-5 mt-4 mb-2"
      >
        <Pressable
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowBloomCard(true);
          }}
          className="bg-white/90 border border-amber-200/50 rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
          style={{ shadowColor: "#d97706", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
              <Flower2 size={20} color="#d97706" />
            </View>
            <View className="ml-3">
              <Text className="text-amber-900 font-bold text-base">Weekly Bloom Ready</Text>
              <Text className="text-amber-700/80 text-xs">Goal met! Tap to collect</Text>
            </View>
          </View>
          <View className="bg-amber-100 rounded-full px-3 py-1">
            <Text className="text-amber-800 text-xs font-bold">Collect</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

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
        {/* Header - Fixed Outside Pager */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          className="px-5 pt-2 mb-2"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Heart size={24} color="#49573c" />
              <Text className="ml-2 text-2xl font-bold text-sage-900" numberOfLines={1}>
                {currentPage === 0
                  ? "My home garden"
                  : groves[currentPage - 1]?.name || "Garden"}
              </Text>
              {currentGroveStreak > 0 && (
                <View className="flex-row items-center bg-amber-100 rounded-full px-2 py-0.5 ml-2">
                  <Flame size={12} color="#f59e0b" />
                  <Text className="text-amber-700 text-xs font-bold ml-1">{currentGroveStreak} Wk</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              {isAuthenticated && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCreateGroveModal(true);
                  }}
                  className="mr-3 w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-sage-200"
                >
                  <Plus size={20} color="#49573c" />
                </Pressable>
              )}
              {isAuthenticated && (
                <Pressable
                  onPress={handleInvite}
                  className="w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-sage-200"
                >
                  <UserPlus size={20} color="#49573c" />
                </Pressable>
              )}
            </View>
          </View>

          <Text className="text-sage-600 mt-1 ml-9">
            {currentPage === 0
              ? `${friends.length} active friends`
              : `${groves[currentPage - 1]?.memberCount || 0} members`}
          </Text>

          {/* Page Indicators */}
          {totalPages > 1 && (
            <View className="flex-row items-center justify-center mt-3">
              {Array.from({ length: totalPages }).map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    pagerRef.current?.setPage(index);
                  }}
                  hitSlop={8}
                >
                  <View
                    className={`w-2 h-2 rounded-full mx-1.5 ${currentPage === index ? "bg-sage-600" : "bg-sage-300"
                      }`}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Swipeable Pages */}
        <PagerView
          style={{ flex: 1 }}
          initialPage={0}
          ref={pagerRef}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          {/* Page 0: Friends Grove */}
          <View key="friend-grove">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#778b5f"
                  colors={["#778b5f"]}
                />
              }
            >

              {/* Weekly Bloom Button (Top) */}
              {renderBloomButton()}

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

              {/* Demo Notice */}
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

              <GroveContent
                members={allMembers.map(m => ({
                  ...m,
                  id: m.id,
                  name: m.name,
                  avatar: (m as any).avatar || (m as any).avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
                  plantLevel: m.plantLevel,
                  totalPoints: m.totalPoints,
                  weeklyPoints: m.weeklyPoints,
                  currentStreak: m.currentStreak,
                  isOnline: m.isOnline,
                  lastActive: m.lastActive,
                  isUser: m.isUser,
                  role: "member"
                }))}
                onMemberPress={(member) => handleFriendPress(member as any)}
                onSendNudge={sendNudge}
                nudgedUsers={nudgedUsers}
                loading={friendsLoading}
                isCustomGrove={false}
              />

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
                    Invite Friends to Garden
                  </Text>
                </Pressable>
              </Animated.View>


            </ScrollView>
          </View>

          {/* Render Custom Grove Pages similarly... logic needs to be applied to mapped pages too */}


          {/* Custom Groves Pages */}
          {
            groves.map((grove) => (
              <View key={grove.id}>
                <ScrollView
                  className="flex-1"
                  contentContainerStyle={{ paddingBottom: 100 }}
                  refreshControl={
                    <RefreshControl
                      refreshing={grovesLoading}
                      onRefresh={refreshGroves}
                      tintColor="#778b5f"
                      colors={["#778b5f"]}
                    />
                  }
                >
                  <GroveContent
                    members={grove.members}
                    onMemberPress={(member) => handleFriendPress(member as any)}
                    onSendNudge={sendNudge}
                    nudgedUsers={nudgedUsers}
                    loading={grovesLoading}
                    isCustomGrove={true}
                    groveName={grove.name}
                  />

                  <View className="mx-5 mt-4">
                    <Pressable
                      onPress={handleInvite}
                      className="bg-sage-100 rounded-2xl p-4 flex-row items-center justify-center mb-2"
                    >
                      <Share2 size={20} color="#5c6e4a" />
                      <Text className="text-sage-800 font-semibold ml-2">
                        Share Garden Code
                      </Text>
                    </Pressable>

                    {grove.isOwner ? (
                      <Pressable
                        onPress={() => handleDeleteGrove(grove.id, grove.name)}
                        className="bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-center justify-center mb-2"
                      >
                        <Trash2 size={20} color="#ef4444" />
                        <Text className="text-red-600 font-semibold ml-2">Delete Garden</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => handleLeaveGrove(grove.id, grove.name)}
                        className="bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-center justify-center mb-2"
                      >
                        <LogOut size={20} color="#ef4444" />
                        <Text className="text-red-600 font-semibold ml-2">Leave Garden</Text>
                      </Pressable>
                    )}
                  </View>
                </ScrollView>
              </View>
            ))
          }
        </PagerView >
      </SafeAreaView >

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
                garden!
              </Text>
            </View>

            {/* Invite Code */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-sm text-sage-500 mb-2">
                {currentPage === 0 ? "Your invite code" : "Garden invite code"}
              </Text>
              <View className="flex-row items-center">
                <View className="flex-1 bg-sage-50 rounded-xl px-4 py-3">
                  <Text className="text-xl font-bold text-sage-800 text-center tracking-widest">
                    {currentPage === 0 ? inviteCode : groves[currentPage - 1]?.inviteCode || "Loading..."}
                  </Text>
                </View>
                <Pressable
                  onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    await Clipboard.setStringAsync(currentPage === 0 ? inviteCode : groves[currentPage - 1]?.inviteCode || "");
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
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
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                try {
                  await Share.share({
                    message: generateShareMessage(
                      currentPage === 0 ? inviteCode : groves[currentPage - 1]?.inviteCode || "",
                      userName
                    ),
                  });
                } catch (error) {
                  // Error handling
                }
              }}
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

      {/* Create Grove Modal */}
      <CreateGroveModal
        visible={showCreateGroveModal}
        onClose={() => setShowCreateGroveModal(false)}
        onCreateGrove={async (name) => {
          const result = await createGrove(name);
          if (result.success) {
            setToastMessage(`Created "${name}" garden!`);
          }
          return result;
        }}
      />
      <WeeklyBloomCard
        visible={showBloomCard}
        onClose={() => setShowBloomCard(false)}
        gardenName={currentPage === 0 ? "My home garden" : groves[currentPage - 1]?.name || "Garden"}
        totalXP={totalGroupXP}
        streakDays={currentGroveStreak}
        topGardener={currentMembers?.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0))[0] ? {
          name: currentMembers.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0))[0].name,
          avatar: (currentMembers[0] as any).avatar_url || (currentMembers[0] as any).avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
          points: currentMembers[0].weeklyPoints || 0
        } : undefined}
      />
    </View >
  );
}
