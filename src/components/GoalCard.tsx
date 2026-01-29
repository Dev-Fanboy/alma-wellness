import React, { useState } from "react";
import { View, Text, Pressable, Modal, TextInput } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Footprints,
  Droplets,
  Brain,
  BookHeart,
  Target,
  Plus,
  Check,
  Moon,
  Apple,
  Dumbbell,
  Timer,
  LucideIcon,
  X,
  Minus,
  Heart,
  Smile,
  Wind,
  Pill,
  Leaf,
  Sun,
  Coffee,
  Eye,
  Bike,
  Music,
  Bell,
  Clock,
} from "lucide-react-native";
import { Goal } from "@/lib/store";
import { cn } from "@/lib/cn";
import { playTap } from "@/lib/sounds";
import {
  getNotificationSettings,
  saveGoalNotificationSetting,
  removeGoalNotificationSetting,
  GoalNotificationSetting
} from "@/lib/notifications";

const ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  Droplets,
  Brain,
  BookHeart,
  Target,
  Moon,
  Apple,
  Dumbbell,
  Timer,
  Bell,
  Clock,
  Heart,
  Smile,
  Wind,
  Pill,
  Leaf,
  Sun,
  Coffee,
  Eye,
  Bike,
  Music,
};

// Define quick-add amounts based on goal type/unit
const getQuickAddAmounts = (goal: Goal): number[] => {
  const { unit, target } = goal;

  // Steps
  if (unit === "steps") {
    return [100, 500, 1000, 5000];
  }

  // Glasses of water
  if (unit === "glasses" || unit === "glass") {
    return [1, 2, 4];
  }

  // Minutes (meditation, focus, etc.)
  if (unit === "minutes" || unit === "mins" || unit === "min") {
    if (target <= 15) return [1, 5, 10];
    if (target <= 30) return [5, 10, 15];
    return [5, 15, 30];
  }

  // Hours
  if (unit === "hours" || unit === "hrs" || unit === "hour") {
    return [1, 2, 4];
  }

  // Generic small targets (1-10)
  if (target <= 10) {
    return [1, 2, 5];
  }

  // Generic medium targets (11-100)
  if (target <= 100) {
    return [1, 5, 10, 25];
  }

  // Generic large targets
  return [1, 10, 50, 100];
};

const TIME_OPTIONS = [
  "07:00", "08:00", "09:00", "10:00", "12:00",
  "14:00", "16:00", "18:00", "20:00", "21:00"
];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

interface GoalCardProps {
  goal: Goal;
  onIncrement: () => void;
  onComplete: () => void;
  onUpdateProgress?: (progress: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GoalCard({ goal, onIncrement, onComplete, onUpdateProgress }: GoalCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");

  React.useEffect(() => {
    if (showModal) {
      loadNotificationSettings();
    }
  }, [showModal]);

  const loadNotificationSettings = async () => {
    const settings = await getNotificationSettings();
    const goalSetting = settings.goalSpecificReminders.find(s => s.goalId === goal.id);
    if (goalSetting) {
      setReminderEnabled(goalSetting.enabled);
      setReminderTime(goalSetting.reminderTime);
    } else {
      setReminderEnabled(false);
    }
  };

  const toggleReminder = async () => {
    const newEnabled = !reminderEnabled;
    setReminderEnabled(newEnabled);

    if (newEnabled) {
      await saveGoalNotificationSetting({
        goalId: goal.id,
        goalName: goal.name,
        enabled: true,
        reminderTime: reminderTime,
        useInterval: goal.type === "hydration", // Default interval for water
        intervalHours: 4,
        endTime: "20:00"
      });
    } else {
      await removeGoalNotificationSetting(goal.id);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTimeSelect = async (time: string) => {
    setReminderTime(time);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (reminderEnabled) {
      await saveGoalNotificationSetting({
        goalId: goal.id,
        goalName: goal.name,
        enabled: true,
        reminderTime: time,
        useInterval: goal.type === "hydration",
        intervalHours: 4,
        endTime: "20:00"
      });
    }
  };

  const scale = useSharedValue(1);
  const checkScale = useSharedValue(1);
  const progress = goal.current / goal.target;
  const isComplete = progress >= 1;

  const Icon = ICON_MAP[goal.icon] || Target;
  const quickAddAmounts = getQuickAddAmounts(goal);

  // For small increments (water glasses, entries, etc), tap the + to add 1
  const isSmallIncrement = goal.target <= 10;

  const handleQuickAdd = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playTap();
    const newProgress = Math.min(goal.current + amount, goal.target);

    if (onUpdateProgress) {
      onUpdateProgress(newProgress);
    }

    if (newProgress >= goal.target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playTap();
      setShowModal(false);
    }
  };

  const handleSetValue = () => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value) || value < 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playTap();
    const newProgress = Math.min(value, goal.target);

    if (onUpdateProgress) {
      onUpdateProgress(newProgress);
    }

    if (newProgress >= goal.target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playTap();
    }

    setInputValue("");
    setShowModal(false);
  };

  const handleLongPress = () => {
    if (isComplete) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playTap();
    checkScale.value = withSpring(1, { damping: 12 });
    onComplete();
  };

  const handlePress = () => {
    if (isComplete) return;

    // For small targets, just increment by 1 on tap
    if (isSmallIncrement) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Play soft tap sound for all actions
      playTap();
      scale.value = withSequence(
        withSpring(0.95, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );

      if (goal.current + 1 >= goal.target) {
        checkScale.value = withSpring(1, { damping: 12 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playTap();
        onComplete();
      } else {
        onIncrement();
      }
    } else {
      // For large targets (like steps), show the modal
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowModal(true);
    }
  };

  const handlePlusPress = () => {
    if (isComplete) return;

    if (isSmallIncrement) {
      // For small increments, just add 1
      handlePress();
    } else {
      // For large targets, show modal
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowModal(true);
    }
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <>
      <AnimatedPressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={800}
        style={cardStyle}
        className={cn(
          "bg-white rounded-2xl p-4 mb-3 shadow-sm",
          isComplete && "bg-sage-50"
        )}
      >
        <View className="flex-row items-center">
          {/* Icon */}
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: goal.color + "20" }}
          >
            <Icon size={24} color={goal.color} strokeWidth={2} />
          </View>

          {/* Content */}
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-sage-900">
                {goal.name}
              </Text>
              <Text className="text-sm text-sage-500">+{goal.points} pts</Text>
            </View>

            {/* Progress bar */}
            <View className="mt-2 h-2 bg-sage-100 rounded-full overflow-hidden">
              <Animated.View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: goal.color,
                }}
              />
            </View>

            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-sm font-medium text-sage-700">
                {goal.current.toLocaleString()}
                <Text className="text-sage-400 font-normal"> / {goal.target.toLocaleString()} {goal.unit}</Text>
              </Text>
              {!isComplete && goal.target - goal.current > 0 && (
                <Text className="text-xs text-sage-500">
                  {goal.target - goal.current} left
                </Text>
              )}
            </View>
          </View>

          {/* Action button */}
          <Pressable
            onPress={handlePlusPress}
            onLongPress={handleLongPress}
            delayLongPress={800}
            className="ml-3"
          >
            {isComplete ? (
              <Animated.View
                style={checkStyle}
                className="w-14 h-14 rounded-2xl bg-sage-500 items-center justify-center shadow-sm"
              >
                <Check size={24} color="white" strokeWidth={2.5} />
              </Animated.View>
            ) : (
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm"
                style={{ backgroundColor: goal.color + "15" }}
              >
                {isSmallIncrement ? (
                  <Text className="text-lg font-bold" style={{ color: goal.color }}>+1</Text>
                ) : (
                  <Plus size={24} color={goal.color} strokeWidth={2} />
                )}
              </View>
            )}
          </Pressable>
        </View>
      </AnimatedPressable>

      {/* Progress Input Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-cream rounded-t-3xl pt-6 pb-10 px-5">
            {/* Handle */}
            <View className="w-10 h-1 bg-sage-300 rounded-full self-center mb-6" />

            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: goal.color + "20" }}
                >
                  <Icon size={20} color={goal.color} strokeWidth={2} />
                </View>
                <View className="ml-3">
                  <Text className="text-xl font-bold text-sage-900">
                    {goal.name}
                  </Text>
                  <Text className="text-sm text-sage-500">
                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
              >
                <X size={20} color="#49573c" />
              </Pressable>
            </View>

            {/* Progress bar */}
            <View className="mb-6">
              <View className="h-3 bg-sage-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(progress * 100, 100)}%`,
                    backgroundColor: goal.color,
                  }}
                />
              </View>
              <Text className="text-xs text-sage-500 mt-1 text-center">
                {Math.round(progress * 100)}% complete
              </Text>
            </View>

            {/* Quick Add Buttons */}
            <Text className="text-sm font-medium text-sage-700 mb-3">
              Quick Add
            </Text>
            <View className="flex-row flex-wrap mb-6">
              {quickAddAmounts.map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => handleQuickAdd(amount)}
                  className="bg-white rounded-xl px-4 py-3 mr-2 mb-2 border border-sage-200"
                  style={{ minWidth: 70 }}
                >
                  <Text className="text-sage-800 font-semibold text-center">
                    +{amount.toLocaleString()}
                  </Text>
                </Pressable>
              ))}

              {/* Complete button */}
              <Pressable
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  if (onUpdateProgress) {
                    onUpdateProgress(goal.target);
                  }
                  setShowModal(false);
                }}
                className="bg-sage-500 rounded-xl px-4 py-3 mr-2 mb-2"
                style={{ minWidth: 90 }}
              >
                <Text className="text-white font-semibold text-center">
                  Complete
                </Text>
              </Pressable>
            </View>

            {/* Manual Input */}
            <Text className="text-sm font-medium text-sage-700 mb-3">
              Set Exact Value
            </Text>
            <View className="flex-row">
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={`Enter ${goal.unit}`}
                placeholderTextColor="#94a67e"
                keyboardType="number-pad"
                className="flex-1 bg-white rounded-xl px-4 py-3 text-sage-900 text-lg border border-sage-200"
              />
              <Pressable
                onPress={handleSetValue}
                disabled={!inputValue}
                className={`ml-3 rounded-xl px-6 items-center justify-center ${inputValue ? "bg-sage-500" : "bg-sage-200"
                  }`}
              >
                <Text className={`font-semibold ${inputValue ? "text-white" : "text-sage-400"}`}>
                  Set
                </Text>
              </Pressable>
            </View>

            {/* Reminder Toggle */}
            <Pressable
              onPress={toggleReminder}
              className="mt-6 flex-row items-center justify-between bg-white rounded-xl px-4 py-3 border border-sage-200"
            >
              <View className="flex-row items-center">
                <Bell size={20} color={reminderEnabled ? "#5c6e4a" : "#94a67e"} />
                <Text className="ml-3 text-sage-900 font-medium">Daily Reminder</Text>
              </View>
              <View className={`w-12 h-6 rounded-full ${reminderEnabled ? "bg-sage-500" : "bg-sage-200"} relative`}>
                <View className={`absolute top-1 bottom-1 w-4 h-4 rounded-full bg-white transition-all ${reminderEnabled ? "right-1" : "left-1"}`} />
              </View>
            </Pressable>

            {/* Time Picker */}
            {reminderEnabled && (
              <View className="mt-3 bg-white rounded-xl p-3 border border-sage-200">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Clock size={16} color="#5c6e4a" />
                    <Text className="ml-2 text-sage-900 font-medium">Reminder Time</Text>
                  </View>
                  <Text className="text-sage-600 font-medium">{formatTime(reminderTime)}</Text>
                </View>
                <View className="flex-row flex-wrap">
                  {TIME_OPTIONS.map((time) => (
                    <Pressable
                      key={time}
                      onPress={() => handleTimeSelect(time)}
                      className={`mr-2 mb-2 px-3 py-1.5 rounded-lg border ${reminderTime === time
                        ? "bg-sage-500 border-sage-500"
                        : "bg-sage-50 border-sage-200"
                        }`}
                    >
                      <Text
                        className={`text-xs ${reminderTime === time ? "text-white font-medium" : "text-sage-600"
                          }`}
                      >
                        {formatTime(time)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {goal.type === "hydration" && (
                  <Text className="text-xs text-sage-500 mt-1 italic">
                    *Hydration reminders repeat every 4 hours until 8 PM
                  </Text>
                )}
              </View>
            )}

            {/* Remaining hint */}

            {/* Remaining hint */}
            {goal.current < goal.target && (
              <Text className="text-xs text-sage-500 mt-4 text-center">
                {(goal.target - goal.current).toLocaleString()} {goal.unit} remaining to complete
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
