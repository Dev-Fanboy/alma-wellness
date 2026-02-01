import React, { useRef, useState } from "react";
import { View, Text, Pressable, Modal, Image, ActivityIndicator } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import { X, Share2, Sparkles, Trophy, Flower2, Sprout } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface WeeklyBloomCardProps {
    visible: boolean;
    onClose: () => void;
    gardenName: string;
    totalXP: number;
    streakDays: number; // or weeks
    topGardener?: {
        name: string;
        avatar: string;
        points: number;
    };
}

export function WeeklyBloomCard({
    visible,
    onClose,
    gardenName,
    totalXP,
    streakDays,
    topGardener,
}: WeeklyBloomCardProps) {
    const viewShotRef = useRef<ViewShot>(null);
    const [sharing, setSharing] = useState(false);

    const handleShare = async () => {
        try {
            setSharing(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            if (viewShotRef.current?.capture) {
                const uri = await viewShotRef.current.capture();
                await Sharing.shareAsync(uri);
            }
        } catch (e) {
            console.error("Error sharing bloom card:", e);
        } finally {
            setSharing(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 justify-center items-center px-6">
                <View className="w-full max-w-sm">
                    {/* Card Container to Capture */}
                    <ViewShot
                        ref={viewShotRef}
                        options={{ format: "png", quality: 0.9 }}
                        style={{ borderRadius: 24, overflow: "hidden" }}
                    >
                        <LinearGradient
                            colors={["#2d3a29", "#3d4a38", "#5c6e4a"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-6 items-center relative overflow-hidden"
                        >
                            {/* Floral Background Pattern */}
                            <View className="absolute inset-0 opacity-10">
                                {/* Top Right Cluster */}
                                <View className="absolute top-[-20] right-[-20]">
                                    <Flower2 size={120} color="#e8ebe3" />
                                </View>
                                <View className="absolute top-[40] right-[60]">
                                    <Flower2 size={60} color="#e8ebe3" />
                                </View>
                                <View className="absolute top-[80] right-[-10]">
                                    <Sprout size={80} color="#d97706" />
                                </View>

                                {/* Bottom Left Cluster */}
                                <View className="absolute bottom-[-30] left-[-30]">
                                    <Flower2 size={140} color="#e8ebe3" />
                                </View>
                                <View className="absolute bottom-[80] left-[20]">
                                    <Flower2 size={50} color="#e8ebe3" />
                                </View>
                                <View className="absolute bottom-[40] left-[80]">
                                    <Sprout size={60} color="#d97706" />
                                </View>

                                {/* Scattered */}
                                <View className="absolute top-[40%] left-[10%] opacity-50">
                                    <Flower2 size={30} color="#e8ebe3" />
                                </View>
                                <View className="absolute bottom-[40%] right-[10%] opacity-50">
                                    <Flower2 size={40} color="#e8ebe3" />
                                </View>
                            </View>

                            {/* Header */}
                            <View className="flex-row items-center mb-6">
                                <Flower2 size={24} color="#e8ebe3" />
                                <Text className="text-white/90 font-serif ml-2 text-lg italic">
                                    Weekly Bloom
                                </Text>
                            </View>

                            {/* Garden Name */}
                            <Text className="text-white text-2xl font-bold text-center mb-1">
                                {gardenName}
                            </Text>
                            <Text className="text-white/70 text-sm tracking-widest uppercase mb-8">
                                Garden Goal Met
                            </Text>

                            {/* Main Stats */}
                            <View className="bg-white/10 rounded-3xl p-6 w-full items-center border border-white/20 mb-6">
                                <Text className="text-5xl font-bold text-amber-300 mb-2">
                                    {totalXP.toLocaleString()}
                                </Text>
                                <Text className="text-white/80 text-sm font-medium">
                                    Total XP Earned
                                </Text>
                            </View>

                            {/* Streak Badge */}
                            {streakDays > 0 && (
                                <View className="flex-row items-center bg-amber-500/20 px-4 py-2 rounded-full mb-6">
                                    <Sparkles size={16} color="#fbbf24" />
                                    <Text className="text-amber-300 font-bold ml-2">
                                        {streakDays} Week Streak!
                                    </Text>
                                </View>
                            )}

                            {/* Top Gardener */}
                            {topGardener && (
                                <View className="flex-row items-center bg-white/5 rounded-2xl p-3 w-full">
                                    <View className="relative">
                                        <Image
                                            source={{ uri: topGardener.avatar }}
                                            className="w-10 h-10 rounded-full bg-white/10"
                                        />
                                        <View className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
                                            <Trophy size={10} color="#78350f" />
                                        </View>
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-white font-semibold text-sm">
                                            {topGardener.name}
                                        </Text>
                                        <Text className="text-white/60 text-xs">
                                            Top Gardener ({topGardener.points} XP)
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Footer Branding */}
                            <View className="mt-8 pt-4 border-t border-white/10 w-full items-center">
                                <Text className="text-white/40 text-[10px] uppercase tracking-widest">
                                    Alma Wellness App
                                </Text>
                            </View>
                        </LinearGradient>
                    </ViewShot>

                    {/* Action Buttons (Outside capture) */}
                    <View className="flex-row mt-6 space-x-4">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 py-4 bg-white/10 rounded-2xl items-center"
                        >
                            <Text className="text-white font-semibold">Done</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleShare}
                            disabled={sharing}
                            className="flex-1 py-4 bg-amber-400 rounded-2xl items-center flex-row justify-center"
                        >
                            {sharing ? (
                                <ActivityIndicator size="small" color="#78350f" />
                            ) : (
                                <>
                                    <Share2 size={20} color="#78350f" />
                                    <Text className="text-amber-900 font-bold ml-2">Share</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
