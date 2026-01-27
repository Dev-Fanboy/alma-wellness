import React from "react";
import { View, Text, Modal, Pressable, Image } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Sun, CloudRain, Shield, Check, X } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

interface MorningBriefingProps {
    visible: boolean;
    onClose: () => void;
    status: {
        newDay: boolean;
        streakBroken: boolean;
        rescued: boolean;
    };
    streakCount: number;
}

export function MorningBriefing({
    visible,
    onClose,
    status,
    streakCount,
}: MorningBriefingProps) {
    const { streakBroken, rescued } = status;

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/60 justify-center items-center px-6">
                <BlurView intensity={20} className="absolute inset-0" />

                <Animated.View
                    entering={FadeInUp.springify().damping(15)}
                    className="w-full bg-cream rounded-3xl overflow-hidden shadow-2xl"
                    style={{ maxWidth: 400 }}
                >
                    {/* Zen Gradient Background */}
                    <LinearGradient
                        colors={
                            streakBroken
                                ? ["#f5f4f0", "#e8e8e8", "#dcdcdc"] // Grey scale for broken streak
                                : rescued
                                    ? ["#fffbf0", "#fff5e0", "#ffeacc"] // Warm amber for rescue
                                    : ["#f7fcf5", "#eef9eb", "#e3f5de"] // Fresh green for success
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-8 items-center"
                    >
                        {/* Header Icon */}
                        <Animated.View entering={FadeIn.delay(200).duration(500)}>
                            <View className="w-20 h-20 rounded-full bg-white/50 items-center justify-center mb-6 shadow-sm">
                                {streakBroken ? (
                                    <CloudRain size={40} color="#787878" />
                                ) : rescued ? (
                                    <Shield size={40} color="#e6a23c" />
                                ) : (
                                    <Sun size={40} color="#778b5f" />
                                )}
                            </View>
                        </Animated.View>

                        {/* Title */}
                        <Animated.View entering={FadeInUp.delay(300)}>
                            <Text
                                className={`text-2xl font-light text-center mb-2 font-serif ${streakBroken ? "text-gray-600" : "text-sage-900"
                                    }`}
                            >
                                {streakBroken
                                    ? "The Rain Has Fallen"
                                    : rescued
                                        ? "Streak Rescued"
                                        : "A Fresh Morning"}
                            </Text>
                        </Animated.View>

                        {/* Description */}
                        <Animated.View entering={FadeInUp.delay(400)}>
                            <Text className="text-sage-600 text-center text-sm leading-6 mb-8 px-4">
                                {streakBroken
                                    ? "You missed a day in the garden, but do not worry. Every sunrise brings a new chance to grow."
                                    : rescued
                                        ? "You missed a day, but your Sun Stone protected your garden. Your streak remains unbroken."
                                        : "Your garden is thriving! The morning sun brings new energy for your daily goals."}
                            </Text>
                        </Animated.View>

                        {/* Stats Card */}
                        <Animated.View
                            entering={FadeInUp.delay(500)}
                            className="w-full bg-white/60 rounded-2xl p-4 mb-8 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center mr-3">
                                    <Image
                                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/744/744922.png" }}
                                        className="w-5 h-5 tint-sage-600"
                                        style={{ tintColor: "#5c6e4a" }}
                                    />
                                </View>
                                <View>
                                    <Text className="text-xs text-sage-500 uppercase tracking-wider">
                                        Current Streak
                                    </Text>
                                    <Text className="text-lg font-bold text-sage-800">
                                        {streakCount} Days
                                    </Text>
                                </View>
                            </View>

                            {/* Status Badge */}
                            <View className={`px-3 py-1 rounded-full ${streakBroken ? "bg-gray-200" : "bg-sage-200"
                                }`}>
                                <Text className={`text-xs font-semibold ${streakBroken ? "text-gray-600" : "text-sage-700"
                                    }`}>
                                    {streakBroken ? "Broken" : "Active"}
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Action Button */}
                        <Animated.View entering={FadeInUp.delay(600)} className="w-full">
                            <Pressable
                                onPress={handleClose}
                                className={`w-full py-4 rounded-xl items-center shadow-sm active:opacity-90 ${streakBroken ? "bg-gray-800" : "bg-sage-600"
                                    }`}
                            >
                                <Text className="text-white font-semibold text-base tracking-wide">
                                    {streakBroken ? "Begin Anew" : "Continue Journey"}
                                </Text>
                            </Pressable>
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}
