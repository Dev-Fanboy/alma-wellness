import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Bell, Users, Sparkles, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface NotificationPromptProps {
    visible: boolean;
    onAllow: () => void;
    onSkip: () => void;
}

export function NotificationPrompt({ visible, onAllow, onSkip }: NotificationPromptProps) {
    const handleAllow = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onAllow();
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSkip();
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View className="flex-1 bg-black/60 justify-center items-center px-6">
                <Animated.View
                    entering={FadeIn.duration(300)}
                    className="bg-cream rounded-3xl p-6 w-full max-w-sm overflow-hidden"
                >
                    {/* Close button */}
                    <Pressable
                        onPress={handleSkip}
                        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-sage-100 items-center justify-center"
                    >
                        <X size={16} color="#778b5f" />
                    </Pressable>

                    {/* Icon */}
                    <Animated.View
                        entering={FadeInUp.delay(100).duration(400)}
                        className="items-center mb-4"
                    >
                        <LinearGradient
                            colors={["#94a67e", "#778b5f"]}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 24,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Bell size={40} color="white" />
                        </LinearGradient>
                    </Animated.View>

                    {/* Title */}
                    <Animated.Text
                        entering={FadeInUp.delay(150).duration(400)}
                        className="text-xl font-bold text-sage-900 text-center mb-2"
                    >
                        Stay Connected
                    </Animated.Text>

                    {/* Description */}
                    <Animated.Text
                        entering={FadeInUp.delay(200).duration(400)}
                        className="text-sm text-sage-600 text-center mb-5"
                    >
                        Enable notifications to make the most of your wellness journey
                    </Animated.Text>

                    {/* Benefits */}
                    <Animated.View
                        entering={FadeInUp.delay(250).duration(400)}
                        className="bg-sage-50 rounded-2xl p-4 mb-5"
                    >
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-sage-200 items-center justify-center mr-3">
                                <Users size={16} color="#778b5f" />
                            </View>
                            <Text className="text-sm text-sage-700 flex-1">
                                Know when friends join your garden
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-sage-200 items-center justify-center mr-3">
                                <Sparkles size={16} color="#778b5f" />
                            </View>
                            <Text className="text-sm text-sage-700 flex-1">
                                Celebrate milestones together
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-sage-200 items-center justify-center mr-3">
                                <Bell size={16} color="#778b5f" />
                            </View>
                            <Text className="text-sm text-sage-700 flex-1">
                                Get gentle wellness reminders
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Buttons */}
                    <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                        <Pressable
                            onPress={handleAllow}
                            className="bg-sage-500 py-4 rounded-xl mb-3 active:opacity-80"
                        >
                            <Text className="text-white font-semibold text-center text-base">
                                Enable Notifications
                            </Text>
                        </Pressable>
                        <Pressable onPress={handleSkip} className="py-2">
                            <Text className="text-sage-500 font-medium text-center text-sm">
                                Maybe Later
                            </Text>
                        </Pressable>
                    </Animated.View>
                </Animated.View>
            </View>
        </Modal>
    );
}
