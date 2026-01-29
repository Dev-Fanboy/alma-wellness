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
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
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
      "Connect with friends and see everyone's plants grow in a shared garden. Support each other's journey and blossom together.",
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

  // Render Item with Zen Luxury changes
  const renderSlide = ({ item, index }: { item: TourSlide; index: number }) => {
    const Icon = item.icon;

    // Slower, more relaxed entrance animations
    return (
      <View style={{ width: SCREEN_WIDTH }} className="flex-1 px-8 justify-center">
        {/* Icon/Image Container - Increased spacing */}
        <View className="items-center justify-center mb-12 min-h-[220px]">
          {item.showPlant ? (
            <Animated.View
              entering={FadeInUp.delay(300).duration(1000).springify().damping(20)}
            >
              <View className="bg-sage-50/50 rounded-full p-8">
                <Plant
                  stage={item.plantStage || "seed"}
                  level={item.plantStage === "blooming" ? 15 : 1}
                  size={200}
                />
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInUp.delay(300).duration(1000).springify().damping(20)}
            >
              <View
                className="w-40 h-40 rounded-full items-center justify-center shadow-lg shadow-sage-200/50"
                style={{ backgroundColor: "#ffffff" }}
              >
                <View
                  className="w-32 h-32 rounded-full items-center justify-center opacity-20 absolute"
                  style={{ backgroundColor: item.accentColor }}
                />
                <Icon size={64} color={item.accentColor} strokeWidth={1.5} />
              </View>
            </Animated.View>
          )}
        </View>

        {/* Text Content - Serif styling for title, airy description */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(800)}
          className="items-center"
        >
          <Text
            className="text-4xl font-medium text-sage-900 text-center leading-tight mb-6"
            style={{ fontFamily: "System" }} // Ideally would use a serif font stack if available
          >
            {item.title}
          </Text>

          <Text
            className="text-lg text-sage-600/90 text-center leading-relaxed mb-10 font-normal"
          >
            {item.description}
          </Text>
        </Animated.View>

        {/* Tip - Softer styling */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(800)}
          className="bg-white/90 rounded-2xl px-6 py-4 shadow-sm border border-sage-50 self-center"
        >
          <View className="flex-row items-center space-x-3">
            <Sparkles size={16} color={item.accentColor} />
            <Text
              className="text-sm font-medium tracking-wide"
              style={{ color: item.accentColor }}
            >
              {item.tip.toUpperCase()}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-cream">
      {/* Background Gradient - Softer */}
      <LinearGradient
        colors={["#e8ebe3", "#fdfbf7", "#fdfbf7"]}
        locations={[0, 0.4, 1]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1">
        {/* Header Navigation */}
        <View className="flex-row justify-between items-center px-6 pt-2 z-10">
          <View className="flex-row space-x-1">
            {TOUR_SLIDES.map((_, index) => (
              <Animated.View
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex
                  ? "bg-sage-600 w-8"
                  : "bg-sage-200 w-2"
                  }`}
              />
            ))}
          </View>

          <Pressable
            onPress={handleSkip}
            className="bg-white/80 px-4 py-2 rounded-full shadow-sm"
          >
            <Text className="text-sage-600 font-medium text-sm">Skip</Text>
          </Pressable>
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
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          bounces={false}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Bottom Action Area */}
        <View className="p-8 pb-10">
          <Pressable
            onPress={handleNext}
            className="bg-sage-800 rounded-3xl py-5 shadow-lg shadow-sage-900/10 flex-row items-center justify-center active:opacity-90"
          >
            <Text className="text-white font-semibold text-lg tracking-wide mr-2">
              {isLastSlide ? "Begin Journey" : "Next"}
            </Text>
            {!isLastSlide && <ChevronRight size={20} color="white" strokeWidth={2} />}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
