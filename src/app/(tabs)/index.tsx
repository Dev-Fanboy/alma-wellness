import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Sparkles, Flame, BookHeart, ChevronRight, Clock } from "lucide-react-native";
import { Plant } from "@/components/Plant";
import { GoalCard } from "@/components/GoalCard";
import { ShareModal } from "@/components/ShareModal";
import { MorningBriefing } from "@/components/MorningBriefing";
import { MilestoneStreakBadge } from "@/components/MilestoneStreakBadge";
import { useWellnessStore } from "@/lib/store";
import { checkAndResetDailyGoals } from "@/utils/dailyReset";
import { useFonts, CinzelDecorative_700Bold } from "@expo-google-fonts/cinzel-decorative";
import { DailySeedsCard } from "@/components/DailySeedsCard";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    CinzelDecorative_700Bold,
  });
  const { action } = useLocalSearchParams<{ action: string }>();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [dailySeedsVisible, setDailySeedsVisible] = useState(false);
  const [briefingVisible, setBriefingVisible] = useState(false);
  const [briefingData, setBriefingData] = useState<{
    newDay: boolean;
    streakBroken: boolean;
    rescued: boolean;
  } | null>(null);

  // Handle deep link actions
  React.useEffect(() => {
    if (action === "openDailySeed") {
      setDailySeedsVisible(true);
      // Optional: Clear the param (requires replace) - keeping simple for now
    }
  }, [action]);

  // Check for daily reset on mount
  React.useEffect(() => {
    // Small delay to allow store to rehydrate and animations to start
    const timer = setTimeout(() => {
      const result = checkAndResetDailyGoals();
      if (result.newDay) {
        setBriefingData(result);
        setBriefingVisible(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const goals = useWellnessStore((s) => s.goals);
  const plantLevel = useWellnessStore((s) => s.plantLevel);
  const plantStage = useWellnessStore((s) => s.plantStage);
  const plantPoints = useWellnessStore((s) => s.plantPoints);
  const userName = useWellnessStore((s) => s.userName);
  const currentStreak = useWellnessStore((s) => s.currentStreak);
  const longestStreak = useWellnessStore((s) => s.longestStreak);
  const journalEntries = useWellnessStore((s) => s.journalEntries);
  const updateGoalProgress = useWellnessStore((s) => s.updateGoalProgress);
  const completeGoal = useWellnessStore((s) => s.completeGoal);

  const completedGoals = goals.filter((g) => g.current >= g.target).length;
  const totalGoals = goals.length;
  const pointsToNextLevel = 100 - (plantPoints % 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getStageLabel = () => {
    switch (plantStage) {
      case "seed":
        return "Seed";
      case "sprout":
        return "Sprout";
      case "growing":
        return "Growing";
      case "budding":
        return "Budding";
      case "blooming":
        return "Blooming";
    }
  };

  const handleGoalPress = (goal: (typeof goals)[0]) => {
    // If it's a journaling goal, open the journal modal
    if (goal.type === "journaling" && goal.current < goal.target) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push("/journal");
      return true; // Handled
    }
    return false; // Not handled, use default behavior
  };

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#e8ebe3", "#fdfbf7", "#fdfbf7"]}
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
            className="px-5 pt-4 pb-2"
          >
            {/* Brand Name - refined and minimal */}
            <Text
              className="text-sm tracking-widest text-sage-500 uppercase mb-1"
              style={{ letterSpacing: 3 }}
            >
              alma wellness
            </Text>

            {/* Greeting Row with Streak */}
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-light text-sage-900">
                {getGreeting()}
                {userName ? `, ${userName}` : ""}
              </Text>

              <View className="items-end flex-row space-x-3">
                {/* Daily Seeds Button */}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDailySeedsVisible(true);
                  }}
                  className="bg-white/50 p-2 rounded-full border border-sage-200"
                >
                  <BookHeart size={20} color="#778b5f" />
                </Pressable>

                {/* Milestone Pulse Effect */}
                <MilestoneStreakBadge
                  streak={currentStreak}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShareModalVisible(true);
                  }}
                />
              </View>
            </View>
          </Animated.View>

          {/* Plant Section */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(800)}
            className="items-center mt-4"
          >
            <View className="items-center">
              <Plant stage={plantStage} level={plantLevel} size={220} />

              {/* Plant info card */}
              <View className="bg-white/80 rounded-2xl px-5 py-3 mt-2 shadow-sm">
                <View className="flex-row items-center">
                  <Sparkles size={18} color="#778b5f" />
                  <Text className="ml-2 text-base font-semibold text-sage-800">
                    Level {plantLevel} - {getStageLabel()}
                  </Text>
                </View>
                <View className="mt-2 h-2 bg-sage-100 rounded-full w-48 overflow-hidden">
                  <View
                    className="h-full bg-sage-500 rounded-full"
                    style={{ width: `${plantPoints % 100}%` }}
                  />
                </View>
                <Text className="text-xs text-sage-500 mt-1 text-center">
                  {pointsToNextLevel} points to next level
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Daily Progress */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="px-5 mt-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-sage-900">
                Today's Goals
              </Text>
              <View className="bg-sage-100 rounded-full px-3 py-1">
                <Text className="text-sm font-medium text-sage-700">
                  {completedGoals}/{totalGoals} done
                </Text>
              </View>
            </View>

            {/* Goal Cards */}
            {goals.map((goal, index) => (
              <Animated.View
                key={goal.id}
                entering={FadeInUp.delay(400 + index * 100).duration(500)}
              >
                <GoalCard
                  goal={goal}
                  onIncrement={() => {
                    const handled = handleGoalPress(goal);
                    if (!handled) {
                      updateGoalProgress(goal.id, goal.current + 1);
                    }
                  }}
                  onComplete={() => {
                    const handled = handleGoalPress(goal);
                    if (!handled) {
                      completeGoal(goal.id);
                    }
                  }}
                  onUpdateProgress={(progress) => {
                    if (progress >= goal.target) {
                      completeGoal(goal.id);
                    } else {
                      updateGoalProgress(goal.id, progress);
                    }
                  }}
                />
              </Animated.View>
            ))}
          </Animated.View>

          {/* Motivational message */}
          {completedGoals === totalGoals && totalGoals > 0 && (
            <Animated.View
              entering={FadeInUp.duration(600)}
              className="mx-5 mt-4 bg-sage-500 rounded-2xl p-4"
            >
              <Text className="text-white text-center text-base font-semibold">
                Amazing! You've completed all goals today!
              </Text>
              <Text className="text-sage-100 text-center text-sm mt-1">
                Your plant is thriving thanks to you
              </Text>
            </Animated.View>
          )}

          {/* Quick Journal Access - if not completed today */}
          {goals.find(
            (g) => g.type === "journaling" && g.current < g.target
          ) && (
              <Animated.View
                entering={FadeInUp.delay(600).duration(500)}
                className="mx-5 mt-4"
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/journal");
                  }}
                  className="bg-white rounded-2xl p-4 flex-row items-center border border-sage-100"
                >
                  <View className="w-12 h-12 rounded-xl bg-pink-50 items-center justify-center">
                    <BookHeart size={24} color="#e7a7b8" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-sage-900">
                      Write in your journal
                    </Text>
                    <Text className="text-sm text-sage-500">
                      Take a moment to reflect on your day
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            )}

          {/* Journal Section - Always visible */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            className="mx-5 mt-4"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <BookHeart size={20} color="#778b5f" />
                <Text className="ml-2 text-lg font-semibold text-sage-900">
                  Journal
                </Text>
              </View>
              {journalEntries.length > 0 && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/journal-history");
                  }}
                  className="flex-row items-center"
                >
                  <Text className="text-sage-600 text-sm mr-1">View all</Text>
                  <ChevronRight size={16} color="#778b5f" />
                </Pressable>
              )}
            </View>

            {/* New Entry Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/journal");
              }}
              className="bg-sage-500 rounded-2xl p-4 flex-row items-center justify-center mb-3"
            >
              <BookHeart size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                New Journal Entry
              </Text>
            </Pressable>

            {/* Recent Entry Preview */}
            {journalEntries.length > 0 && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/journal-history");
                }}
                className="bg-white rounded-2xl p-4 border border-sage-100"
              >
                <View className="flex-row items-center mb-2">
                  <Clock size={14} color="#94a67e" />
                  <Text className="text-xs text-sage-500 ml-1">
                    {new Date(journalEntries[0].date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  {journalEntries[0].mood && (
                    <View className="ml-2 bg-sage-100 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-sage-600 capitalize">
                        {journalEntries[0].mood}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sage-800 text-sm" numberOfLines={2}>
                  {journalEntries[0].content}
                </Text>
                <Text className="text-sage-400 text-xs mt-2">
                  {journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"} total
                </Text>
              </Pressable>
            )}

            {journalEntries.length === 0 && (
              <View className="bg-sage-50 rounded-2xl p-4 items-center">
                <Text className="text-sage-600 text-sm text-center">
                  Start your journaling journey today
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        type="streak"
        streakCount={currentStreak}
        longestStreak={longestStreak}
        userName={userName}
      />

      {/* Morning Briefing Modal */}
      {briefingData && (
        <MorningBriefing
          visible={briefingVisible}
          onClose={() => {
            setBriefingVisible(false);
            // Auto-open Daily Seeds after briefing
            setTimeout(() => setDailySeedsVisible(true), 500);
          }}
          status={briefingData}
          streakCount={currentStreak}
        />
      )}

      {/* Daily Seeds Modal */}
      <DailySeedsCard visible={dailySeedsVisible} onClose={() => setDailySeedsVisible(false)} />
    </View>
  );
}
