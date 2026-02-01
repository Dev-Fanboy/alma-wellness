import React from "react";
import { View, Text, Image, Pressable, ActivityIndicator, ScrollView } from "react-native";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import {
    Flower2,
    Flame,
    Sparkles,
    CloudRain,
    Droplet,
    Target,
} from "lucide-react-native";
import { Plant } from "@/components/Plant";
import { Friend } from "@/lib/store";

// Weekly target for the grove
const WEEKLY_TARGET_XP = 2500;

interface GroveMember {
    id: string;
    name: string;
    avatar: string;
    plantLevel: number;
    totalPoints: number;
    weeklyPoints?: number;
    currentStreak?: number;
    isOnline?: boolean;
    lastActive?: number;
    isUser?: boolean;
    role?: string;
}

interface GroveContentProps {
    members: GroveMember[];
    onMemberPress: (member: GroveMember) => void;
    onSendNudge: (userId: string, userName: string) => void;
    nudgedUsers: Set<string>;
    loading?: boolean;
    isCustomGrove?: boolean;
    groveName?: string;
}

export function GroveContent({
    members,
    onMemberPress,
    onSendNudge,
    nudgedUsers,
    loading = false,
    isCustomGrove = false,
    groveName,
}: GroveContentProps) {
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

    // Calculate group stats
    const totalGroupXP = members.reduce(
        (sum, member) => sum + (member.weeklyPoints ?? 0),
        0
    );
    const groveProgress = Math.min((totalGroupXP / WEEKLY_TARGET_XP) * 100, 100);
    const progressPercent = Math.round(groveProgress);

    // Sort by lastActive (ascending) - people who need help at the top
    const sortedByNeed = [...members].sort(
        (a, b) => (b.lastActive ?? 0) - (a.lastActive ?? 0)
    );

    // For the plant grid, keep original order but show top 24
    const gridMembers = members.slice(0, 24);

    if (loading) {
        return (
            <View className="mt-8 mb-8 items-center justify-center">
                <ActivityIndicator size="large" color="#778b5f" />
                <Text className="text-sage-400 text-sm mt-3">Growing your garden...</Text>
            </View>
        );
    }

    return (
        <>
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
                                <Text className="text-sm text-sage-500">
                                    {isCustomGrove ? groveName : "Garden"} Vitality
                                </Text>
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
            <Animated.View
                entering={FadeInUp.delay(200).duration(800)}
                className="mt-4 mx-5"
            >
                <View className="bg-white/60 rounded-3xl p-4 shadow-sm">
                    <ScrollView
                        className="max-h-96"
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                    >
                        <View className="flex-row flex-wrap justify-center pb-4">
                            {gridMembers.map((member, index) => {
                                const wilting = isWilting(member.lastActive);
                                return (
                                    <Pressable
                                        key={member.id}
                                        onPress={() => onMemberPress(member)}
                                        className="w-1/3 items-center py-4"
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
                                                <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center bg-sage-200">
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
                    </ScrollView>
                </View>
            </Animated.View>

            {/* Grove Care Section */}
            <Animated.View
                entering={FadeInUp.delay(250).duration(600)}
                className="px-5 mt-6"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <CloudRain size={20} color="#778b5f" />
                        <Text className="ml-2 text-xl font-bold text-sage-900">
                            Garden Care
                        </Text>
                    </View>
                    <Text className="text-xs text-sage-500">Help wilting plants</Text>
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
                                onPress={() => !member.isUser && onMemberPress(member)}
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
                                        {member.role === "owner" && !member.isUser && (
                                            <View className="ml-2 bg-amber-200 rounded-full px-2 py-0.5">
                                                <Text className="text-[10px] text-amber-800 font-medium">
                                                    OWNER
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
                                        onPress={() => onSendNudge(member.id, member.name)}
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
        </>
    );
}
