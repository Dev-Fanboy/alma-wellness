import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    FadeIn
} from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';

const MILESTONES = [3, 7, 14, 21, 30, 60, 90, 100, 365];

interface MilestoneStreakBadgeProps {
    streak: number;
    onPress: () => void;
}

export function MilestoneStreakBadge({ streak, onPress }: MilestoneStreakBadgeProps) {
    const isMilestone = MILESTONES.includes(streak);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (isMilestone) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );
        }
    }, [isMilestone]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={{ alignItems: 'center' }}>
            {isMilestone && (
                <Animated.View
                    entering={FadeIn.delay(500)}
                    className="absolute -top-8 bg-sage-500 rounded-full px-2 py-1 mb-1 z-10"
                >
                    <Text className="text-white text-xs font-bold">Share!</Text>
                    <View className="absolute bottom-[-4px] left-1/2 -ml-1 w-2 h-2 bg-sage-500 rotate-45" />
                </Animated.View>
            )}

            <Pressable onPress={onPress}>
                <Animated.View
                    style={[animatedStyle]}
                    className={`rounded-full px-3 py-2 flex-row items-center ${isMilestone ? "bg-amber-100 border border-amber-200" : "bg-sage-100"
                        }`}
                >
                    <Flame
                        size={14}
                        color={isMilestone ? "#d97706" : "#778b5f"}
                        fill={isMilestone ? "#fbbf24" : "none"}
                    />
                    <Text className={`font-medium ml-1 text-sm ${isMilestone ? "text-amber-700 font-bold" : "text-sage-700"
                        }`}>
                        {streak}
                    </Text>
                </Animated.View>
            </Pressable>
        </View>
    );
}
