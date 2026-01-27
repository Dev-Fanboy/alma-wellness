import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Leaf,
  Target,
  Users,
  BookHeart,
  TrendingUp,
  Sparkles,
  ChevronRight,
  X,
  Mountain,
} from "lucide-react-native";
import { Plant } from "@/components/Plant";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FeatureTourProps {
  onComplete: () => void;
}

interface TourSlide {
  id: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  description: string;
  tip: string;
  accentColor: string;
  showPlant?: boolean;
  plantStage?: "seed" | "sprout" | "growing" | "budding" | "blooming";
}

const TOUR_SLIDES: TourSlide[] = [
  {
    id: "welcome",
    icon: Leaf,
    title: "Welcome to\nAlma Wellness",
    description:
      "Let's take a quick tour to help you get the most out of your wellness journey.",
    tip: "Swipe left to continue or tap Next",
    accentColor: "#778b5f",
    showPlant: true,
    plantStage: "seed",
  },
  {
    id: "goals",
    icon: Target,
    title: "Track Daily Goals",
    description:
      "Complete your wellness goals like steps, hydration, meditation, and journaling. Tap the + button to track progress, or tap the checkmark to complete.",
    tip: "Find your goals on the Home tab",
    accentColor: "#94a67e",
  },
  {
    id: "plant",
    icon: Sparkles,
    title: "Grow Your Plant",
    description:
      "Each goal you complete earns points. As you collect points, your plant grows from a tiny seed into a beautiful bloom.",
    tip: "Watch it grow on the Home screen",
    accentColor: "#5c6e4a",
    showPlant: true,
    plantStage: "blooming",
  },
  {
    id: "journal",
    icon: BookHeart,
    title: "Daily Journaling",
    description:
      "Reflect on your day with guided prompts. Track your mood and build a habit of gratitude and self-awareness.",
    tip: "Tap 'New Journal Entry' on Home",
    accentColor: "#e7a7b8",
  },
  {
    id: "garden",
    icon: Users,
    title: "Community Garden",
    description:
      "Connect with friends and see everyone's plants in a shared garden. Compete on the leaderboard and motivate each other!",
    tip: "Visit the Garden tab to invite friends",
    accentColor: "#7fb3d3",
  },
  {
    id: "retreats",
    icon: Mountain,
    title: "Wellness Retreats",
    description:
      "Discover in-person wellness events and retreats. See what's included, who's leading, and register for upcoming experiences.",
    tip: "Explore the Retreats tab",
    accentColor: "#e7c4a7",
  },
  {
    id: "progress",
    icon: TrendingUp,
    title: "Track Your Progress",
    description:
      "View your streaks, achievements, and weekly activity in your profile. Unlock badges as you build healthy habits.",
    tip: "Check the Profile tab for stats",
    accentColor: "#c4a7e7",
  },
];

export function FeatureTour({ onComplete }: FeatureTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const isLastSlide = currentIndex === TOUR_SLIDES.length - 1;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLastSlide) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: { item: TourSlide; index: number }) => {
    const Icon = item.icon;

    return (
      <View style={{ width: SCREEN_WIDTH }} className="flex-1 px-6">
        <View className="flex-1 justify-center items-center">
          {/* Icon or Plant */}
          {item.showPlant ? (
            <Animated.View
              entering={FadeInUp.delay(200).duration(600)}
              className="mb-6"
            >
              <Plant
                stage={item.plantStage || "seed"}
                level={item.plantStage === "blooming" ? 15 : 1}
                size={180}
              />
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInUp.delay(200).duration(600)}
              className="mb-8"
            >
              <View
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{ backgroundColor: item.accentColor + "20" }}
              >
                <Icon size={48} color={item.accentColor} />
              </View>
            </Animated.View>
          )}

          {/* Title */}
          <Animated.Text
            entering={FadeInUp.delay(300).duration(500)}
            className="text-3xl font-bold text-sage-900 text-center leading-tight mb-4"
          >
            {item.title}
          </Animated.Text>

          {/* Description */}
          <Animated.Text
            entering={FadeInUp.delay(400).duration(500)}
            className="text-base text-sage-600 text-center leading-relaxed mb-6 px-4"
          >
            {item.description}
          </Animated.Text>

          {/* Tip card */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(500)}
            className="bg-white/80 rounded-2xl px-5 py-3 shadow-sm"
          >
            <View className="flex-row items-center">
              <Sparkles size={16} color={item.accentColor} />
              <Text
                className="ml-2 text-sm font-medium"
                style={{ color: item.accentColor }}
              >
                {item.tip}
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#d4dac9", "#e8ebe3", "#fdfbf7"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1">
        {/* Skip button */}
        <View className="absolute top-4 right-4 z-10">
          <SafeAreaView edges={["top"]}>
            <Pressable
              onPress={handleSkip}
              className="flex-row items-center px-4 py-2"
            >
              <Text className="text-sage-500 text-base mr-1">Skip</Text>
              <X size={18} color="#94a67e" />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Progress dots */}
        <View className="flex-row justify-center pt-4 pb-2">
          {TOUR_SLIDES.map((_, index) => (
            <Animated.View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIndex ? "bg-sage-600 w-6" : "bg-sage-300 w-2"
              }`}
            />
          ))}
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={TOUR_SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Bottom navigation */}
        <View className="px-8 pb-8">
          {/* Page indicator text */}
          <Text className="text-center text-sage-400 text-sm mb-4">
            {currentIndex + 1} of {TOUR_SLIDES.length}
          </Text>

          {/* Main CTA button */}
          <Pressable
            onPress={handleNext}
            className="bg-sage-600 rounded-2xl py-4 flex-row items-center justify-center"
          >
            <Text className="text-white font-semibold text-lg mr-2">
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
            <ChevronRight size={20} color="white" strokeWidth={2.5} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
