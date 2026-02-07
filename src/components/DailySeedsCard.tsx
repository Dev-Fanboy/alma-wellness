import React, { useEffect, useState, useRef } from "react";
import { View, Text, Modal, Pressable, Dimensions, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import PagerView from "react-native-pager-view";
import { X, Sparkles, ScrollText, ChevronLeft, ChevronRight } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { DailySeed, fetchDailySeeds } from "@/lib/api/dailySeeds";

interface DailySeedsCardProps {
    visible: boolean;
    onClose: () => void;
}

const { width } = Dimensions.get("window");

export function DailySeedsCard({ visible, onClose }: DailySeedsCardProps) {
    const [seeds, setSeeds] = useState<DailySeed[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const pagerRef = useRef<PagerView>(null);

    useEffect(() => {
        if (visible) {
            loadSeeds();
        }
    }, [visible]);

    const loadSeeds = async () => {
        try {
            setLoading(true);
            const data = await fetchDailySeeds();
            setSeeds(data);
        } catch (error) {
            console.error("Failed to load daily seeds", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if it's today (ignoring time components for safety)
        const d = new Date(dateString + 'T00:00:00');
        if (d.toDateString() === today.toDateString()) {
            return "Today's Seed";
        }

        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            </BlurView>

            <View className="flex-1 justify-center items-center p-4">
                <Animated.View
                    entering={FadeInDown.springify().damping(15)}
                    className="w-full max-w-sm bg-[#fdfbf7] rounded-3xl overflow-hidden shadow-2xl relative"
                    style={{ height: 480 }}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center p-5 border-b border-sage-100/50">
                        <View className="flex-row items-center">
                            <ScrollText size={20} color="#778b5f" />
                            <Text className="ml-2 text-lg font-serif text-sage-900 font-semibold tracking-wide">
                                Daily Seeds
                            </Text>
                        </View>
                        <Pressable onPress={onClose} className="p-2 bg-sage-50 rounded-full">
                            <X size={18} color="#778b5f" />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <View className="flex-1 relative">
                        {loading ? (
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-sage-500">Planting seeds...</Text>
                            </View>
                        ) : seeds.length === 0 ? (
                            <View className="flex-1 justify-center items-center p-8">
                                <Text className="text-sage-600 text-center font-medium">
                                    No seeds found today. Check back later!
                                </Text>
                            </View>
                        ) : (
                            <PagerView
                                ref={pagerRef}
                                style={{ flex: 1 }}
                                initialPage={0}
                                onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
                            >
                                {seeds.map((seed, index) => (
                                    <View key={seed.id} className="flex-1 justify-center items-center p-8">
                                        <View className="mb-6 items-center">
                                            <View className="bg-sage-100 rounded-full px-4 py-1.5 mb-2">
                                                <Text className="text-sage-700 text-xs font-bold uppercase tracking-widest">
                                                    {formatDate(seed.publish_date)}
                                                </Text>
                                            </View>
                                            {index === 0 && (
                                                <View className="flex-row items-center mt-1">
                                                    <Sparkles size={12} color="#eab308" />
                                                    <Text className="text-xs text-yellow-600 ml-1 font-medium">New</Text>
                                                </View>
                                            )}
                                        </View>

                                        <Text className="text-2xl text-center text-sage-900 font-serif leading-9 italic">
                                            "{seed.content}"
                                        </Text>

                                        <View className="mt-8 items-center">
                                            <View className="h-1 w-12 bg-sage-200 rounded-full" />
                                            <Text className="text-sage-400 text-xs mt-3 font-serif italic">
                                                Alma Wellness
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </PagerView>
                        )}

                        {/* Pagination Dots */}
                        {!loading && seeds.length > 1 && (
                            <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-2">
                                {seeds.map((_, i) => (
                                    <View
                                        key={i}
                                        className={`h-2 w-2 rounded-full ${i === pageIndex ? 'bg-sage-600 w-4' : 'bg-sage-300'}`}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Navigation Buttons */}
                        {!loading && seeds.length > 1 && (
                            <>
                                {/* Previous Button */}
                                {pageIndex > 0 && (
                                    <Pressable
                                        onPress={() => {
                                            if (pageIndex > 0) {
                                                pagerRef.current?.setPage(pageIndex - 1);
                                            }
                                        }}
                                        className="absolute left-2 top-1/2 -mt-4 p-2 bg-white/50 rounded-full"
                                    >
                                        <ChevronLeft size={24} color="#5e6e4c" />
                                    </Pressable>
                                )}

                                {/* Next Button */}
                                {pageIndex < seeds.length - 1 && (
                                    <Pressable
                                        onPress={() => {
                                            if (pageIndex < seeds.length - 1) {
                                                pagerRef.current?.setPage(pageIndex + 1);
                                            }
                                        }}
                                        className="absolute right-2 top-1/2 -mt-4 p-2 bg-white/50 rounded-full"
                                    >
                                        <ChevronRight size={24} color="#5e6e4c" />
                                    </Pressable>
                                )}
                            </>
                        )}


                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
