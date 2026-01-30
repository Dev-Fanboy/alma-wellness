import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import {
  Leaf,
  Heart,
  Sparkles,
  ArrowRight,
  Check,
  Footprints,
  Droplets,
  Brain,
  BookHeart,
  Moon,
  Apple,
  Wind,
  Sun,
} from "lucide-react-native";
import { Plant } from "@/components/Plant";
import { useWellnessStore, GoalType } from "@/lib/store";
import { soundManager, playChime, playTap, playCelebration, playStoneClick, playWaterDrop } from "@/lib/sounds";
import { applySmartDefaults } from "@/lib/notifications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingProps {
  onComplete: () => void;
}

interface GoalSuggestion {
  id: string;
  type: GoalType;
  name: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  target: number;
  unit: string;
  points: number;
  color: string;
  iconName: string;
}

// 8 Core wellness goals - curated for intentional living
const GOAL_SUGGESTIONS: GoalSuggestion[] = [
  {
    id: "hydration",
    type: "hydration",
    name: "Hydration",
    description: "Nourish your body",
    icon: Droplets,
    target: 8,
    unit: "glasses",
    points: 15,
    color: "#7fb3d3",
    iconName: "Droplets",
  },
  {
    id: "meditation",
    type: "meditation",
    name: "Meditation",
    description: "Find your center",
    icon: Brain,
    target: 10,
    unit: "minutes",
    points: 25,
    color: "#c4a7e7",
    iconName: "Brain",
  },
  {
    id: "walking",
    type: "walking",
    name: "Movement",
    description: "Honor your body",
    icon: Footprints,
    target: 10000,
    unit: "steps",
    points: 20,
    color: "#94a67e",
    iconName: "Footprints",
  },
  {
    id: "journaling",
    type: "journaling",
    name: "Gratitude",
    description: "Reflect & appreciate",
    icon: BookHeart,
    target: 1,
    unit: "entry",
    points: 30,
    color: "#e7a7b8",
    iconName: "BookHeart",
  },
  {
    id: "sleep",
    type: "custom",
    name: "Rest",
    description: "Restore your energy",
    icon: Moon,
    target: 8,
    unit: "hours",
    points: 20,
    color: "#a7b8e7",
    iconName: "Moon",
  },
  {
    id: "breathing",
    type: "custom",
    name: "Breathwork",
    description: "Calm your mind",
    icon: Wind,
    target: 5,
    unit: "minutes",
    points: 15,
    color: "#a7e7d4",
    iconName: "Wind",
  },
  {
    id: "nutrition",
    type: "custom",
    name: "Nourishment",
    description: "Eat with intention",
    icon: Apple,
    target: 3,
    unit: "meals",
    points: 15,
    color: "#e7c4a7",
    iconName: "Apple",
  },
  {
    id: "outdoor",
    type: "custom",
    name: "Nature",
    description: "Connect with earth",
    icon: Sun,
    target: 30,
    unit: "minutes",
    points: 20,
    color: "#f5d76e",
    iconName: "Sun",
  },
];

// Age range options
const AGE_RANGES = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
];

// Wellness focus options
const WELLNESS_FOCUS = [
  { id: "balance", label: "Life Balance", emoji: "⚖️" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "mental", label: "Mental Health", emoji: "🧠" },
  { id: "sleep", label: "Better Sleep", emoji: "😴" },
  { id: "stress", label: "Stress Relief", emoji: "🌿" },
  { id: "mindful", label: "Mindfulness", emoji: "🧘" },
];

// Streamlined 4-step flow for intentional onboarding
const STEPS = [
  {
    id: "welcome",
    icon: Leaf,
    title: "",
    subtitle: "Your mindful companion for intentional living",
    showLogo: true,
  },
  {
    id: "about-you",
    icon: Heart,
    title: "About You",
    subtitle: "Help us personalize your experience",
    showLogo: false,
    hasProfileCollection: true,
  },
  {
    id: "select-goals",
    icon: Heart,
    title: "Set Your\nIntentions",
    subtitle: "Choose the habits that resonate with your journey",
    showLogo: false,
    hasGoalSelection: true,
  },
  {
    id: "name",
    icon: Sparkles,
    title: "Begin Your\nJourney",
    subtitle: "What should we call you?",
    showLogo: false,
    hasInput: true,
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [wellnessFocus, setWellnessFocus] = useState<Set<string>>(new Set());
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(
    new Set(["hydration", "meditation", "walking", "journaling"])
  );
  const setStoreName = useWellnessStore((s) => s.setUserName);
  const setGoals = useWellnessStore((s) => s.setGoals);
  const setStoreAgeRange = useWellnessStore((s) => s.setUserAgeRange);
  const setStoreWellnessFocus = useWellnessStore((s) => s.setUserWellnessFocus);
  const inputRef = useRef<TextInput>(null);

  const translateX = useSharedValue(0);
  const breatheScale = useSharedValue(1);
  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  // Initialize sound manager and breathing animation
  useEffect(() => {
    soundManager.init();
    // Gentle breathing animation for plant
    breatheScale.value = withRepeat(
      withTiming(1.05, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const goToNext = () => {
    if (isLastStep) {
      if (userName.trim()) {
        setStoreName(userName.trim());
      }
      // Save profile data
      if (ageRange) {
        setStoreAgeRange(ageRange);
      }
      if (wellnessFocus.size > 0) {
        setStoreWellnessFocus(Array.from(wellnessFocus).join(","));
      }
      // Set selected goals
      const goalsToSet = GOAL_SUGGESTIONS.filter((g) =>
        selectedGoals.has(g.id)
      ).map((g, index) => ({
        id: (Date.now() + index).toString(),
        type: g.type,
        name: g.name,
        icon: g.iconName,
        target: g.target,
        unit: g.unit,
        current: 0,
        points: g.points,
        color: g.color,
      }));
      setGoals(goalsToSet);

      // Apply smart notification defaults
      applySmartDefaults(goalsToSet);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playCelebration();
      onComplete();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playWaterDrop();
      setCurrentStep((prev) => prev + 1);
    }
  };

  const toggleGoal = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playStoneClick();
    setSelectedGoals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -50 && currentStep < STEPS.length - 1) {
        runOnJS(goToNext)();
      } else if (e.translationX > 50 && currentStep > 0) {
        runOnJS(goToPrev)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.3 }],
  }));

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }));

  const Icon = step.icon;

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#d4dac9", "#e8ebe3", "#fdfbf7"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={animatedStyle} className="flex-1">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
            >
              {/* Progress dots */}
              <View className="flex-row justify-center pt-4 pb-2">
                {STEPS.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 rounded-full mx-1 ${index === currentStep ? "bg-sage-600 w-8" : "bg-sage-300 w-2"
                      }`}
                  />
                ))}
              </View>

              {/* Content */}
              <View className="flex-1 px-6 justify-center">
                <Animated.View
                  key={currentStep}
                  entering={SlideInRight.duration(400)}
                  exiting={SlideOutLeft.duration(300)}
                  className="items-center"
                >
                  {/* Logo or Icon */}
                  {step.showLogo ? (
                    <View className="items-center">
                      <Image
                        source={require("../../public/copy-of-copy-of-alma-design--.png")}
                        style={{ width: 280, height: 140 }}
                        resizeMode="contain"
                      />
                      <Animated.View style={breatheStyle} className="mt-4">
                        <Plant stage="blooming" level={15} size={200} />
                      </Animated.View>
                    </View>
                  ) : !step.hasGoalSelection && !step.hasProfileCollection ? (
                    <View className="w-24 h-24 rounded-full bg-sage-500/15 items-center justify-center mb-8">
                      <Icon size={48} color="#5c6e4a" strokeWidth={1.5} />
                    </View>
                  ) : null}

                  {/* Title */}
                  <Text className={`text-4xl font-bold text-sage-900 text-center leading-tight ${step.hasGoalSelection ? 'mb-2' : ''}`}>
                    {step.title}
                  </Text>

                  {/* Subtitle */}
                  <Text className="text-lg text-sage-600 text-center mt-3 leading-relaxed px-4">
                    {step.subtitle}
                  </Text>

                  {/* About You - Age Range & Wellness Focus */}
                  {step.hasProfileCollection && (
                    <Animated.View
                      entering={FadeInUp.delay(200).duration(400)}
                      className="w-full mt-8"
                    >
                      {/* Age Range */}
                      <Text className="text-sm font-medium text-sage-500 mb-3 text-center">AGE RANGE</Text>
                      <View className="flex-row flex-wrap justify-center mb-6">
                        {AGE_RANGES.map((range) => (
                          <Pressable
                            key={range}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              playStoneClick();
                              setAgeRange(range);
                            }}
                            className={`px-5 py-3 rounded-full mr-2 mb-2 ${ageRange === range
                              ? "bg-sage-500"
                              : "bg-white border border-sage-200"
                              }`}
                          >
                            <Text
                              className={`font-medium ${ageRange === range ? "text-white" : "text-sage-700"
                                }`}
                            >
                              {range}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      {/* Wellness Focus */}
                      <Text className="text-sm font-medium text-sage-500 mb-3 text-center">WELLNESS FOCUS (up to 3)</Text>
                      <View className="flex-row flex-wrap justify-center">
                        {WELLNESS_FOCUS.map((focus) => {
                          const isSelected = wellnessFocus.has(focus.id);
                          return (
                            <Pressable
                              key={focus.id}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                playStoneClick();
                                setWellnessFocus((prev) => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(focus.id)) {
                                    newSet.delete(focus.id);
                                  } else if (newSet.size < 3) {
                                    newSet.add(focus.id);
                                  }
                                  return newSet;
                                });
                              }}
                              className={`px-4 py-3 rounded-xl mr-2 mb-2 flex-row items-center ${isSelected
                                ? "bg-sage-500"
                                : "bg-white border border-sage-200"
                                }`}
                            >
                              <Text className="mr-1">{focus.emoji}</Text>
                              <Text
                                className={`font-medium ${isSelected ? "text-white" : "text-sage-700"
                                  }`}
                              >
                                {focus.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      {wellnessFocus.size > 0 && (
                        <Text className="text-center text-sage-600 text-sm mt-2">
                          {wellnessFocus.size}/3 selected
                        </Text>
                      )}

                      <Text className="text-center text-sage-400 text-sm mt-4">
                        Optional — you can skip this
                      </Text>
                    </Animated.View>
                  )}

                  {/* Goal Selection Grid */}
                  {step.hasGoalSelection && (
                    <Animated.View
                      entering={FadeInUp.delay(200).duration(400)}
                      className="w-full mt-8"
                    >
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: 340 }}
                        contentContainerStyle={{ paddingBottom: 8 }}
                      >
                        <View className="flex-row flex-wrap justify-between">
                          {GOAL_SUGGESTIONS.map((goal) => {
                            const isSelected = selectedGoals.has(goal.id);
                            const GoalIcon = goal.icon;
                            return (
                              <View key={goal.id} className="w-[48%] mb-4">
                                <Pressable
                                  onPress={() => toggleGoal(goal.id)}
                                  className={`p-4 rounded-2xl border-2 ${isSelected
                                    ? "border-sage-500 bg-white"
                                    : "border-sage-200/50 bg-white/60"
                                    }`}
                                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                                >
                                  <View className="flex-row items-center">
                                    <View
                                      className="w-12 h-12 rounded-xl items-center justify-center"
                                      style={{
                                        backgroundColor: isSelected
                                          ? goal.color + "25"
                                          : goal.color + "10",
                                      }}
                                    >
                                      <GoalIcon
                                        size={24}
                                        color={isSelected ? goal.color : goal.color + "90"}
                                      />
                                    </View>
                                    <View className="ml-3 flex-1">
                                      <Text
                                        className={`text-base font-semibold ${isSelected ? "text-sage-900" : "text-sage-600"
                                          }`}
                                        numberOfLines={1}
                                      >
                                        {goal.name}
                                      </Text>
                                      <Text className="text-xs text-sage-400 mt-0.5" numberOfLines={1}>
                                        {goal.description}
                                      </Text>
                                    </View>
                                  </View>
                                  {isSelected && (
                                    <View className="absolute top-3 right-3 w-6 h-6 rounded-full bg-sage-500 items-center justify-center">
                                      <Check size={14} color="white" strokeWidth={3} />
                                    </View>
                                  )}
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      </ScrollView>
                      <Text className="text-center text-sage-500 text-base mt-3">
                        {selectedGoals.size} intention{selectedGoals.size !== 1 ? "s" : ""} set
                      </Text>
                    </Animated.View>
                  )}

                  {/* Name Input */}
                  {step.hasInput && (
                    <Animated.View
                      entering={FadeInUp.delay(200).duration(400)}
                      className="w-full mt-10"
                    >
                      <TextInput
                        ref={inputRef}
                        value={userName}
                        onChangeText={setUserName}
                        placeholder="Your name"
                        placeholderTextColor="#94a67e"
                        selectionColor="#5c6e4a"
                        className="bg-white rounded-2xl px-6 py-5 text-xl text-sage-900 text-center shadow-sm"
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={goToNext}
                      />
                      <Text className="text-center text-sage-400 text-sm mt-4">
                        Every journey begins with a single step
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>
              </View>

              {/* Bottom buttons */}
              <View className="px-8 pb-10">
                {/* Main CTA button */}
                <Pressable
                  onPress={goToNext}
                  disabled={isLastStep && !userName.trim()}
                  className={`rounded-2xl py-5 flex-row items-center justify-center shadow-sm ${isLastStep && !userName.trim()
                    ? "bg-sage-300"
                    : "bg-sage-600"
                    }`}
                  style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
                >
                  <Text className="text-white font-semibold text-lg mr-2">
                    {isLastStep ? "Begin Journey" : "Continue"}
                  </Text>
                  {isLastStep ? (
                    <Sparkles size={20} color="white" strokeWidth={2} />
                  ) : (
                    <ArrowRight size={20} color="white" strokeWidth={2} />
                  )}
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </GestureDetector>
      </SafeAreaView>
    </View>
  );
}
