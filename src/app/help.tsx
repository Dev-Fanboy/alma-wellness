import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  MessageCircle,
  Leaf,
  Target,
  Bell,
  Sparkles,
  Heart,
} from "lucide-react-native";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    question: "What is Alma Wellness?",
    answer:
      "Alma Wellness is your personal wellness companion designed to help you build healthy habits and nurture your wellbeing. Track your daily goals, grow your virtual plant as you progress, and join our community on transformative wellness retreats.",
    icon: Leaf,
  },
  {
    id: "2",
    question: "How do I set and track my wellness goals?",
    answer:
      "Navigate to the Goals tab to add new wellness goals like hydration, meditation, steps, or custom goals. Tap on a goal to mark progress throughout the day. For numerical goals (like steps), use the slider to log your progress quickly. Your completed goals help grow your virtual plant!",
    icon: Target,
  },
  {
    id: "3",
    question: "How does the plant growth system work?",
    answer:
      "Your virtual plant grows as you complete daily wellness goals. Each completed goal earns you points that contribute to your plant's growth. As you accumulate points, your plant evolves through different stages—from a tiny seedling to a flourishing bloom. Maintain daily streaks for bonus growth!",
    icon: Sparkles,
  },
  {
    id: "4",
    question: "How do notifications and reminders work?",
    answer:
      "You can set personalized reminders for each of your wellness goals. Go to your Profile > Notifications to manage your reminder preferences. When adding or editing goals, you can set specific times to receive gentle nudges to stay on track with your wellness journey.",
    icon: Bell,
  },
  {
    id: "5",
    question: "What are wellness retreats?",
    answer:
      "Our curated wellness retreats are immersive experiences designed to deepen your practice and connect with like-minded individuals. Browse available retreats in the Retreats tab, explore destinations, and book transformative experiences that align with your wellness goals.",
    icon: Heart,
  },
  {
    id: "6",
    question: "How do I maintain my streak?",
    answer:
      "Complete at least one wellness goal each day to maintain your streak. Your current streak is displayed on your profile. The longer your streak, the more achievements you unlock! If you miss a day, don't worry—just pick up where you left off.",
    icon: Sparkles,
  },
  {
    id: "7",
    question: "Can I customize my goals?",
    answer:
      "Absolutely! While we offer suggested goals like hydration, meditation, and steps, you can create custom goals that fit your unique wellness journey. Set your own targets, choose icons, and track what matters most to you.",
    icon: Target,
  },
  {
    id: "8",
    question: "Is my data private and secure?",
    answer:
      "Your privacy is our priority. All your wellness data is stored securely on your device. We do not share your personal information with third parties. You have full control over your data and can reset or delete it anytime from the settings.",
    icon: HelpCircle,
  },
];

function FAQAccordion({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(!isOpen);
  };

  return (
    <Animated.View entering={FadeInUp.delay(200 + index * 50).duration(400)}>
      <Pressable
        onPress={handleToggle}
        className={`bg-white rounded-2xl mb-3 overflow-hidden ${
          isOpen ? "border border-sage-200" : ""
        }`}
      >
        <View className="flex-row items-center p-4">
          <View className="w-10 h-10 rounded-full bg-sage-50 items-center justify-center">
            <Icon size={20} color="#778b5f" />
          </View>
          <Text className="flex-1 ml-3 text-base font-medium text-sage-900 pr-2">
            {item.question}
          </Text>
          {isOpen ? (
            <ChevronUp size={20} color="#778b5f" />
          ) : (
            <ChevronDown size={20} color="#b5c1a5" />
          )}
        </View>
        {isOpen && (
          <View className="px-4 pb-4 pt-0">
            <View className="h-px bg-sage-100 mb-3" />
            <Text className="text-sm text-sage-600 leading-5">
              {item.answer}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function HelpScreen() {
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEmailContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL("mailto:info@almawellness.club");
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
          height: 200,
        }}
      />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className="px-5 pt-2 flex-row items-center"
          >
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white/60 items-center justify-center mr-3"
            >
              <ArrowLeft size={20} color="#49573c" />
            </Pressable>
            <Text className="text-2xl font-bold text-sage-900">
              Help & Support
            </Text>
          </Animated.View>

          {/* Intro Card */}
          <Animated.View
            entering={FadeInUp.delay(150).duration(600)}
            className="mx-5 mt-6 bg-sage-500 rounded-3xl p-5"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <HelpCircle size={24} color="white" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-semibold text-white">
                  How can we help?
                </Text>
                <Text className="text-sm text-sage-100 mt-1">
                  Find answers to common questions below
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* FAQ Section */}
          <View className="px-5 mt-6">
            <Animated.Text
              entering={FadeInUp.delay(180).duration(500)}
              className="text-lg font-semibold text-sage-900 mb-4"
            >
              Frequently Asked Questions
            </Animated.Text>

            {FAQ_DATA.map((item, index) => (
              <FAQAccordion key={item.id} item={item} index={index} />
            ))}
          </View>

          {/* Contact Section */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="px-5 mt-6"
          >
            <Text className="text-lg font-semibold text-sage-900 mb-4">
              Still need help?
            </Text>

            <View className="bg-white rounded-2xl overflow-hidden">
              <Pressable
                onPress={handleEmailContact}
                className="flex-row items-center p-4"
              >
                <View className="w-12 h-12 rounded-full bg-sage-50 items-center justify-center">
                  <Mail size={22} color="#778b5f" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-base font-medium text-sage-900">
                    Email Us
                  </Text>
                  <Text className="text-sm text-sage-500 mt-0.5">
                    info@almawellness.club
                  </Text>
                </View>
                <View className="bg-sage-100 px-3 py-1.5 rounded-full">
                  <Text className="text-xs font-medium text-sage-700">
                    Contact
                  </Text>
                </View>
              </Pressable>

              <View className="h-px bg-sage-50 mx-4" />

              <View className="p-4">
                <View className="flex-row items-start">
                  <MessageCircle size={18} color="#b5c1a5" />
                  <Text className="flex-1 ml-3 text-sm text-sage-500 leading-5">
                    We typically respond within 24-48 hours. For urgent matters,
                    please include "Urgent" in your subject line.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            className="px-5 mt-8 items-center"
          >
            <View className="flex-row items-center">
              <Leaf size={16} color="#b5c1a5" />
              <Text className="text-sm text-sage-400 ml-2">
                Alma Wellness Club
              </Text>
            </View>
            <Text className="text-xs text-sage-300 mt-2 text-center">
              Nurturing your journey to wellbeing
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
