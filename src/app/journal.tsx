import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { X, Send, Smile, Meh, Frown, Heart } from "lucide-react-native";
import { useWellnessStore } from "@/lib/store";
import { playSuccess, playTap, playChime } from "@/lib/sounds";

const PROMPTS = [
  "What are you grateful for today?",
  "What made you smile today?",
  "What's one thing you're proud of?",
  "What's something kind you did today?",
  "What's a challenge you overcame?",
  "Who made a positive impact on your day?",
  "What's one thing you learned today?",
  "What are you looking forward to tomorrow?",
];

type MoodId = "great" | "good" | "okay" | "low";

const MOOD_COLORS: Record<MoodId, string> = {
  great: "#94a67e",
  good: "#7fb3d3",
  okay: "#c4a7e7",
  low: "#e7a7b8",
};

export default function JournalScreen() {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [currentPrompt] = useState(
    () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
  );

  const addJournalEntry = useWellnessStore((s) => s.addJournalEntry);
  const goals = useWellnessStore((s) => s.goals);
  const completeGoal = useWellnessStore((s) => s.completeGoal);

  const handleSave = useCallback(() => {
    if (!content.trim()) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics may not be available on all devices
    }
    playSuccess(); // Play success sound on journal save

    addJournalEntry({
      date: new Date().toISOString(),
      content: content.trim(),
      mood: selectedMood ?? undefined,
      prompt: currentPrompt,
    });

    // Complete journaling goal if exists
    const journalGoal = goals.find((g) => g.type === "journaling");
    if (journalGoal && journalGoal.current < journalGoal.target) {
      completeGoal(journalGoal.id);
    }

    router.back();
  }, [content, selectedMood, currentPrompt, addJournalEntry, goals, completeGoal]);

  const handleClose = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics may not be available on all devices
    }
    router.back();
  }, []);

  const handleMoodSelect = useCallback((mood: MoodId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    playChime(); // Play gentle chime on mood selection
    setSelectedMood(mood);
  }, []);

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#e8ebe3", "#fdfbf7", "#fdfbf7"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 200 }}
      />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
            <Pressable
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
            >
              <X size={20} color="#49573c" />
            </Pressable>
            <Text className="text-lg font-semibold text-sage-900">
              Daily Journal
            </Text>
            <Pressable
              onPress={handleSave}
              disabled={!content.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                content.trim() ? "bg-sage-500" : "bg-sage-200"
              }`}
            >
              <Send size={18} color="white" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 px-5"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Prompt Card */}
            <Animated.View
              entering={FadeInUp.delay(100).duration(500)}
              className="bg-sage-100 rounded-2xl p-4 mb-5"
            >
              <Text className="text-sage-600 text-sm mb-1">
                Today's reflection
              </Text>
              <Text className="text-sage-900 text-lg font-medium">
                {currentPrompt}
              </Text>
            </Animated.View>

            {/* Mood Selector */}
            <View className="mb-5">
              <Text className="text-sage-700 text-base font-medium mb-3">
                How are you feeling?
              </Text>
              <View className="flex-row justify-between">
                {/* Great */}
                <Pressable
                  onPress={() => handleMoodSelect("great")}
                  className={`flex-1 mx-1 py-3 rounded-xl items-center ${
                    selectedMood === "great" ? "bg-white shadow-sm" : "bg-sage-50"
                  }`}
                  style={
                    selectedMood === "great"
                      ? { borderWidth: 2, borderColor: MOOD_COLORS.great }
                      : {}
                  }
                >
                  <Heart
                    size={24}
                    color={selectedMood === "great" ? MOOD_COLORS.great : "#94a67e"}
                  />
                  <Text
                    className={`text-xs mt-1 ${
                      selectedMood === "great"
                        ? "font-semibold text-sage-800"
                        : "text-sage-500"
                    }`}
                  >
                    Great
                  </Text>
                </Pressable>

                {/* Good */}
                <Pressable
                  onPress={() => handleMoodSelect("good")}
                  className={`flex-1 mx-1 py-3 rounded-xl items-center ${
                    selectedMood === "good" ? "bg-white shadow-sm" : "bg-sage-50"
                  }`}
                  style={
                    selectedMood === "good"
                      ? { borderWidth: 2, borderColor: MOOD_COLORS.good }
                      : {}
                  }
                >
                  <Smile
                    size={24}
                    color={selectedMood === "good" ? MOOD_COLORS.good : "#94a67e"}
                  />
                  <Text
                    className={`text-xs mt-1 ${
                      selectedMood === "good"
                        ? "font-semibold text-sage-800"
                        : "text-sage-500"
                    }`}
                  >
                    Good
                  </Text>
                </Pressable>

                {/* Okay */}
                <Pressable
                  onPress={() => handleMoodSelect("okay")}
                  className={`flex-1 mx-1 py-3 rounded-xl items-center ${
                    selectedMood === "okay" ? "bg-white shadow-sm" : "bg-sage-50"
                  }`}
                  style={
                    selectedMood === "okay"
                      ? { borderWidth: 2, borderColor: MOOD_COLORS.okay }
                      : {}
                  }
                >
                  <Meh
                    size={24}
                    color={selectedMood === "okay" ? MOOD_COLORS.okay : "#94a67e"}
                  />
                  <Text
                    className={`text-xs mt-1 ${
                      selectedMood === "okay"
                        ? "font-semibold text-sage-800"
                        : "text-sage-500"
                    }`}
                  >
                    Okay
                  </Text>
                </Pressable>

                {/* Low */}
                <Pressable
                  onPress={() => handleMoodSelect("low")}
                  className={`flex-1 mx-1 py-3 rounded-xl items-center ${
                    selectedMood === "low" ? "bg-white shadow-sm" : "bg-sage-50"
                  }`}
                  style={
                    selectedMood === "low"
                      ? { borderWidth: 2, borderColor: MOOD_COLORS.low }
                      : {}
                  }
                >
                  <Frown
                    size={24}
                    color={selectedMood === "low" ? MOOD_COLORS.low : "#94a67e"}
                  />
                  <Text
                    className={`text-xs mt-1 ${
                      selectedMood === "low"
                        ? "font-semibold text-sage-800"
                        : "text-sage-500"
                    }`}
                  >
                    Low
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Text Input */}
            <Animated.View entering={FadeInUp.delay(300).duration(500)}>
              <Text className="text-sage-700 text-base font-medium mb-3">
                Your thoughts
              </Text>
              <View className="bg-white rounded-2xl p-4 min-h-[200px]">
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Write freely about your day, feelings, or anything on your mind..."
                  placeholderTextColor="#b5c1a5"
                  selectionColor="#5c6e4a"
                  multiline
                  textAlignVertical="top"
                  className="text-base text-sage-900 leading-relaxed"
                  style={{ minHeight: 180 }}
                  autoFocus
                />
              </View>
            </Animated.View>

            {/* Character count */}
            <View className="mt-2 items-end">
              <Text className="text-sage-400 text-xs">
                {content.length} characters
              </Text>
            </View>

            {/* Spacer for keyboard */}
            <View className="h-20" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
