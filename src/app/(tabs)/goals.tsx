import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Switch,
} from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Target,
  Plus,
  Trash2,
  Footprints,
  Droplets,
  Brain,
  BookHeart,
  X,
  Check,
  Moon,
  Apple,
  Dumbbell,
  Timer,
  Bell,
  Clock,
  Pencil,
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
  Repeat,
} from "lucide-react-native";
import { useWellnessStore, GoalType, Goal } from "@/lib/store";
import {
  saveGoalNotificationSetting,
  removeGoalNotificationSetting,
  requestNotificationPermissions,
  getNotificationSettings,
} from "@/lib/notifications";

const GOAL_PRESETS = [
  // Core wellness goals
  {
    type: "walking" as GoalType,
    name: "Daily Steps",
    icon: "Footprints",
    target: 10000,
    unit: "steps",
    points: 20,
    color: "#94a67e",
    // Notification defaults
    defaultTime: "08:00",
    useInterval: false,
  },
  {
    type: "hydration" as GoalType,
    name: "Water Intake",
    icon: "Droplets",
    target: 8,
    unit: "glasses",
    points: 15,
    color: "#7fb3d3",
    // Remind throughout the day to drink water
    defaultTime: "08:00",
    useInterval: true,
    intervalHours: 2,
    endTime: "20:00",
  },
  {
    type: "meditation" as GoalType,
    name: "Mindfulness",
    icon: "Brain",
    target: 10,
    unit: "minutes",
    points: 25,
    color: "#c4a7e7",
    // Morning meditation reminder
    defaultTime: "07:00",
    useInterval: false,
  },
  {
    type: "journaling" as GoalType,
    name: "Gratitude",
    icon: "BookHeart",
    target: 1,
    unit: "entry",
    points: 30,
    color: "#e7a7b8",
    // Evening journaling reminder
    defaultTime: "20:00",
    useInterval: false,
  },
  // Additional wellness goals
  {
    type: "custom" as GoalType,
    name: "Sleep Routine",
    icon: "Moon",
    target: 8,
    unit: "hours",
    points: 20,
    color: "#a7b8e7",
    // Bedtime reminder
    defaultTime: "21:30",
    useInterval: false,
  },
  {
    type: "custom" as GoalType,
    name: "Healthy Meals",
    icon: "Apple",
    target: 3,
    unit: "meals",
    points: 15,
    color: "#e7c4a7",
    // Meal reminders throughout the day
    defaultTime: "08:00",
    useInterval: true,
    intervalHours: 4,
    endTime: "18:00",
  },
  {
    type: "custom" as GoalType,
    name: "Exercise",
    icon: "Dumbbell",
    target: 30,
    unit: "minutes",
    points: 25,
    color: "#d4a7e7",
    // Morning exercise reminder
    defaultTime: "07:00",
    useInterval: false,
  },
  {
    type: "custom" as GoalType,
    name: "Focus Time",
    icon: "Timer",
    target: 60,
    unit: "minutes",
    points: 20,
    color: "#e7d4a7",
    // Work hours reminder
    defaultTime: "09:00",
    useInterval: false,
  },
  {
    type: "custom" as GoalType,
    name: "Breathing",
    icon: "Wind",
    target: 5,
    unit: "minutes",
    points: 15,
    color: "#a7e7d4",
    // Multiple breathing breaks
    defaultTime: "10:00",
    useInterval: true,
    intervalHours: 3,
    endTime: "19:00",
  },
  {
    type: "custom" as GoalType,
    name: "Vitamins",
    icon: "Pill",
    target: 3,
    unit: "doses",
    points: 10,
    color: "#e7a7a7",
    // Vitamin reminders throughout the day
    defaultTime: "09:00",
    useInterval: true,
    intervalHours: 4,
    endTime: "21:00",
  },
  {
    type: "custom" as GoalType,
    name: "Screen Break",
    icon: "Eye",
    target: 3,
    unit: "breaks",
    points: 15,
    color: "#b8e7a7",
    // Regular screen break reminders
    defaultTime: "10:00",
    useInterval: true,
    intervalHours: 2,
    endTime: "18:00",
  },
  {
    type: "custom" as GoalType,
    name: "Outdoor Time",
    icon: "Sun",
    target: 30,
    unit: "minutes",
    points: 20,
    color: "#f5d76e",
    // Midday outdoor reminder
    defaultTime: "12:00",
    useInterval: false,
  },
  {
    type: "custom" as GoalType,
    name: "No Caffeine",
    icon: "Coffee",
    target: 1,
    unit: "day",
    points: 15,
    color: "#c4a77d",
    // Morning reminder to avoid caffeine
    defaultTime: "08:00",
    useInterval: false,
  },
  {
    type: "custom" as GoalType,
    name: "Stretching",
    icon: "Heart",
    target: 10,
    unit: "minutes",
    points: 15,
    color: "#e77d7d",
    // Multiple stretch breaks
    defaultTime: "09:00",
    useInterval: true,
    intervalHours: 3,
    endTime: "18:00",
  },
  {
    type: "custom" as GoalType,
    name: "Cycling",
    icon: "Bike",
    target: 20,
    unit: "minutes",
    points: 20,
    color: "#7dc4e7",
    // Morning cycling reminder
    defaultTime: "07:00",
    useInterval: false,
  },
  {
    type: "custom" as GoalType,
    name: "Reading",
    icon: "Leaf",
    target: 20,
    unit: "minutes",
    points: 15,
    color: "#7de7a7",
    // Evening reading reminder
    defaultTime: "20:00",
    useInterval: false,
  },
];

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Footprints,
  Droplets,
  Brain,
  BookHeart,
  Target,
  Moon,
  Apple,
  Dumbbell,
  Timer,
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

const INTERVAL_OPTIONS = [
  { label: "Every 2 hours", value: 2 },
  { label: "Every 3 hours", value: 3 },
  { label: "Every 4 hours", value: 4 },
  { label: "Every 6 hours", value: 6 },
  { label: "Every 8 hours", value: 8 },
];

// Time options for reminder picker - organized by time of day
const TIME_OPTIONS = [
  // Morning
  { label: "6:00 AM", value: "06:00", period: "Morning" },
  { label: "7:00 AM", value: "07:00", period: "Morning" },
  { label: "8:00 AM", value: "08:00", period: "Morning" },
  { label: "9:00 AM", value: "09:00", period: "Morning" },
  { label: "10:00 AM", value: "10:00", period: "Morning" },
  { label: "11:00 AM", value: "11:00", period: "Morning" },
  // Afternoon
  { label: "12:00 PM", value: "12:00", period: "Afternoon" },
  { label: "1:00 PM", value: "13:00", period: "Afternoon" },
  { label: "2:00 PM", value: "14:00", period: "Afternoon" },
  { label: "3:00 PM", value: "15:00", period: "Afternoon" },
  { label: "4:00 PM", value: "16:00", period: "Afternoon" },
  { label: "5:00 PM", value: "17:00", period: "Afternoon" },
  // Evening
  { label: "6:00 PM", value: "18:00", period: "Evening" },
  { label: "7:00 PM", value: "19:00", period: "Evening" },
  { label: "8:00 PM", value: "20:00", period: "Evening" },
  { label: "9:00 PM", value: "21:00", period: "Evening" },
  { label: "10:00 PM", value: "22:00", period: "Evening" },
];

// Helper functions for time conversion
const timeStringToDate = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const dateToTimeString = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatTimeDisplay = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export default function GoalsScreen() {
  const goals = useWellnessStore((s) => s.goals);
  const addGoal = useWellnessStore((s) => s.addGoal);
  const removeGoal = useWellnessStore((s) => s.removeGoal);
  const updateGoal = useWellnessStore((s) => s.updateGoal);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [editGoalData, setEditGoalData] = useState({
    name: "",
    target: "",
    unit: "",
  });
  const [editUseSlider, setEditUseSlider] = useState(false);
  const [editSliderValue, setEditSliderValue] = useState(1000);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [newlyAddedGoal, setNewlyAddedGoal] = useState<Goal | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [useInterval, setUseInterval] = useState(false);
  const [intervalHours, setIntervalHours] = useState(4);
  const [endTime, setEndTime] = useState("21:00");
  const [customGoal, setCustomGoal] = useState({
    name: "",
    target: "",
    unit: "",
  });
  const [useSlider, setUseSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(1000);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<(typeof GOAL_PRESETS)[0] | null>(null);

  // Time picker visibility state
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleAddPreset = (preset: (typeof GOAL_PRESETS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // For walking/steps goal, open custom form with slider pre-filled
    if (preset.type === "walking") {
      setCustomGoal({
        name: preset.name,
        target: "",
        unit: preset.unit,
      });
      setUseSlider(true);
      setSliderValue(preset.target);
      setSelectedPreset(preset);
      return;
    }

    const goalId = Date.now().toString();
    const newGoal: Goal = {
      ...preset,
      id: goalId,
      current: 0,
    };
    addGoal(preset);
    setShowAddModal(false);

    // Show notification setup with preset defaults
    setNewlyAddedGoal({ ...newGoal, id: goalId });
    setSelectedPreset(preset);
    setNotificationEnabled(true);
    setSelectedTime(preset.defaultTime || "09:00");
    setUseInterval(preset.useInterval || false);
    setIntervalHours(preset.intervalHours || 4);
    setEndTime(preset.endTime || "21:00");
    setTimeout(() => setShowNotificationModal(true), 300);
  };

  const handleAddCustom = () => {
    const targetValue = useSlider ? sliderValue : parseInt(customGoal.target, 10);
    if (!customGoal.name || !targetValue || !customGoal.unit) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const goalId = Date.now().toString();

    // Use preset values if available (for walking goal)
    const goalData = selectedPreset && selectedPreset.type === "walking" ? {
      type: selectedPreset.type,
      name: customGoal.name,
      icon: selectedPreset.icon,
      target: targetValue,
      unit: customGoal.unit,
      points: selectedPreset.points,
      color: selectedPreset.color,
    } : {
      type: "custom" as GoalType,
      name: customGoal.name,
      icon: "Target",
      target: targetValue,
      unit: customGoal.unit,
      points: 20,
      color: "#94a67e",
    };

    const newGoal: Goal = {
      id: goalId,
      ...goalData,
      current: 0,
    };

    addGoal(goalData);
    setCustomGoal({ name: "", target: "", unit: "" });
    setUseSlider(false);
    setSliderValue(1000);
    setShowAddModal(false);

    // Show notification setup with preset defaults if available
    setNewlyAddedGoal(newGoal);
    setNotificationEnabled(true);
    if (selectedPreset) {
      setSelectedTime(selectedPreset.defaultTime || "09:00");
      setUseInterval(selectedPreset.useInterval || false);
      setIntervalHours(selectedPreset.intervalHours || 4);
      setEndTime(selectedPreset.endTime || "21:00");
    } else {
      // Reset to defaults for truly custom goals
      setSelectedTime("09:00");
      setUseInterval(false);
      setIntervalHours(4);
      setEndTime("21:00");
    }
    setSelectedPreset(null);
    setTimeout(() => setShowNotificationModal(true), 300);
  };

  const handleSaveNotification = async () => {
    const targetGoal = newlyAddedGoal || goalToEdit;
    if (!targetGoal) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (notificationEnabled) {
      await requestNotificationPermissions();
      await saveGoalNotificationSetting({
        goalId: targetGoal.id,
        goalName: targetGoal.name,
        enabled: true,
        reminderTime: selectedTime,
        useInterval: useInterval,
        intervalHours: intervalHours,
        endTime: endTime,
      });
    } else {
      // If disabled, remove settings
      await removeGoalNotificationSetting(targetGoal.id);
    }

    setShowNotificationModal(false);
    setNewlyAddedGoal(null);

    // If we were editing, re-open the edit modal
    if (goalToEdit) {
      setTimeout(() => setShowEditModal(true), 300);
    } else {
      // Only clear preset if we are not in edit mode
      setSelectedPreset(null);
      // Reset interval settings for next goal
      setSelectedTime("09:00");
      setUseInterval(false);
      setIntervalHours(4);
      setEndTime("21:00");
    }
  };

  const handleSkipNotification = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowNotificationModal(false);
    setNewlyAddedGoal(null);

    // If we were editing, re-open the edit modal
    if (goalToEdit) {
      setTimeout(() => setShowEditModal(true), 300);
    } else {
      setSelectedPreset(null);
      // Reset interval settings for next goal
      setSelectedTime("09:00");
      setUseInterval(false);
      setIntervalHours(4);
      setEndTime("21:00");
    }
  };

  const handleDeletePress = (goal: Goal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await removeGoalNotificationSetting(goalToDelete.id);
    removeGoal(goalToDelete.id);
    setShowDeleteModal(false);
    setGoalToDelete(null);
  };

  const handleCancelDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDeleteModal(false);
    setGoalToDelete(null);
  };

  const handleEditPress = async (goal: Goal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoalToEdit(goal);
    setEditGoalData({
      name: goal.name,
      target: goal.target.toString(),
      unit: goal.unit,
    });
    // Use slider for large targets (like steps)
    if (goal.target >= 100) {
      setEditUseSlider(true);
      setEditSliderValue(goal.target);
    } else {
      setEditUseSlider(false);
    }

    // Load notification settings - ensure modal opens even if this fails
    try {
      const settings = await getNotificationSettings();
      const goalSetting = settings.goalSpecificReminders.find(s => s.goalId === goal.id);

      if (goalSetting) {
        setNotificationEnabled(goalSetting.enabled);
        setSelectedTime(goalSetting.reminderTime || "09:00");
        setUseInterval(goalSetting.useInterval || false);
        setIntervalHours(goalSetting.intervalHours || 4);
        setEndTime(goalSetting.endTime || "20:00");
      } else {
        // Default to off if no settings
        setNotificationEnabled(false);
        setSelectedTime("09:00");
        setUseInterval(false);
      }
    } catch (e) {
      console.error("Failed to load notification settings", e);
      // Fallback defaults
      setNotificationEnabled(false);
      setSelectedTime("09:00");
    } finally {
      // ALWAYS open the modal
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = () => {
    if (!goalToEdit) return;
    const targetValue = editUseSlider ? editSliderValue : parseInt(editGoalData.target, 10);
    if (!editGoalData.name || !targetValue || !editGoalData.unit) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateGoal(goalToEdit.id, {
      name: editGoalData.name,
      target: targetValue,
      unit: editGoalData.unit,
    });
    setShowEditModal(false);
    setGoalToEdit(null);
  };

  const handleCancelEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditModal(false);
    setGoalToEdit(null);
  };

  const totalDailyPoints = goals.reduce((acc, g) => acc + g.points, 0);

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#e8ebe3", "#fdfbf7", "#fdfbf7"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 200 }}
      />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className="px-5 pt-2"
          >
            <View className="flex-row items-center">
              <Target size={24} color="#49573c" />
              <Text className="ml-2 text-2xl font-bold text-sage-900">
                My Goals
              </Text>
            </View>
            <Text className="text-base text-sage-600 mt-1">
              Customize your daily wellness journey
            </Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="flex-row mx-5 mt-4"
          >
            <View className="flex-1 bg-white rounded-2xl p-4 mr-2">
              <Text className="text-3xl font-bold text-sage-700">
                {goals.length}
              </Text>
              <Text className="text-sm text-sage-500">Active Goals</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 ml-2">
              <Text className="text-3xl font-bold text-sage-700">
                {totalDailyPoints}
              </Text>
              <Text className="text-sm text-sage-500">Daily Points</Text>
            </View>
          </Animated.View>

          {/* Goals List */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="px-5 mt-6"
          >
            <Text className="text-lg font-semibold text-sage-900 mb-3">
              Active Goals
            </Text>

            {goals.map((goal, index) => {
              const Icon = ICON_MAP[goal.icon] || Target;
              return (
                <Animated.View
                  key={goal.id}
                  entering={FadeInUp.delay(350 + index * 80).duration(500)}
                  className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: goal.color + "20" }}
                  >
                    <Icon size={24} color={goal.color} />
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-sage-900">
                      {goal.name}
                    </Text>
                    <Text className="text-sm text-sage-500">
                      {goal.target} {goal.unit} daily
                    </Text>
                  </View>

                  <View className="items-end mr-3">
                    <Text className="text-sm font-semibold text-sage-700">
                      +{goal.points}
                    </Text>
                    <Text className="text-xs text-sage-400">pts</Text>
                  </View>

                  <Pressable
                    onPress={() => handleEditPress(goal)}
                    className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center mr-2"
                  >
                    <Pencil size={18} color="#5c6e4a" />
                  </Pressable>

                  <Pressable
                    onPress={() => handleDeletePress(goal)}
                    className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </Pressable>
                </Animated.View>
              );
            })}

            {/* Add Goal Button */}
            <Pressable
              onPress={() => setShowAddModal(true)}
              className="bg-sage-100 rounded-2xl p-4 flex-row items-center justify-center mt-2 border-2 border-dashed border-sage-300"
            >
              <Plus size={20} color="#778b5f" />
              <Text className="ml-2 text-base font-semibold text-sage-700">
                Add New Goal
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-black/40 justify-end">
              <View className="bg-cream rounded-t-3xl pt-6 pb-10 px-5 max-h-[85%]">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-xl font-bold text-sage-900">
                    Add New Goal
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowAddModal(false);
                      setSelectedPreset(null);
                      setUseSlider(false);
                      setCustomGoal({ name: "", target: "", unit: "" });
                    }}
                    className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
                  >
                    <X size={20} color="#49573c" />
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Preset Goals - only show those not already added */}
                  {GOAL_PRESETS.filter(
                    (preset) => !goals.some((g) =>
                      g.name.toLowerCase() === preset.name.toLowerCase() ||
                      (g.type !== "custom" && g.type === preset.type)
                    )
                  ).length > 0 && (
                      <>
                        <Text className="text-base font-semibold text-sage-700 mb-3">
                          Quick Add
                        </Text>
                        <View className="mb-6">
                          {GOAL_PRESETS.filter(
                            (preset) => !goals.some((g) =>
                              g.name.toLowerCase() === preset.name.toLowerCase() ||
                              (g.type !== "custom" && g.type === preset.type)
                            )
                          ).map((preset) => {
                            const Icon = ICON_MAP[preset.icon];
                            return (
                              <Pressable
                                key={preset.name}
                                onPress={() => handleAddPreset(preset)}
                                className="w-full mb-3 p-4 rounded-2xl flex-row items-center bg-white"
                                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                              >
                                <View
                                  className="w-14 h-14 rounded-xl items-center justify-center"
                                  style={{ backgroundColor: preset.color + "20" }}
                                >
                                  <Icon size={28} color={preset.color} />
                                </View>
                                <View className="ml-4 flex-1">
                                  <Text className="text-base font-semibold text-sage-900">
                                    {preset.name}
                                  </Text>
                                  <Text className="text-sm text-sage-500 mt-0.5">
                                    {preset.target} {preset.unit} daily
                                  </Text>
                                </View>
                                <View
                                  className="px-3 py-1.5 rounded-full"
                                  style={{ backgroundColor: preset.color + "15" }}
                                >
                                  <Plus size={20} color={preset.color} />
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </>
                    )}

                  {/* Custom Goal */}
                  <Text className="text-base font-semibold text-sage-700 mb-3">
                    Custom Goal
                  </Text>
                  <View className="bg-white rounded-2xl p-5 mb-6">
                    {/* Goal Name */}
                    <Text className="text-xs font-medium text-sage-500 mb-1">GOAL NAME</Text>
                    <TextInput
                      placeholder="e.g., Read Books, Practice Piano"
                      placeholderTextColor="#94a67e"
                      selectionColor="#5c6e4a"
                      value={customGoal.name}
                      onChangeText={(text) =>
                        setCustomGoal((prev) => ({ ...prev, name: text }))
                      }
                      className="text-base text-sage-900 border-b border-sage-100 pb-3 mb-5"
                      returnKeyType="next"
                    />

                    {/* Target with +/- buttons */}
                    <Text className="text-xs font-medium text-sage-500 mb-1">DAILY TARGET</Text>
                    <View className="flex-row items-center mb-5">
                      <Pressable
                        onPress={() => {
                          const current = parseInt(customGoal.target) || 0;
                          if (current > 1) {
                            setCustomGoal((prev) => ({ ...prev, target: String(current - 1) }));
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                        className="w-12 h-12 rounded-xl bg-sage-100 items-center justify-center"
                      >
                        <Text className="text-xl font-bold text-sage-700">−</Text>
                      </Pressable>
                      <TextInput
                        placeholder="0"
                        placeholderTextColor="#94a67e"
                        selectionColor="#5c6e4a"
                        value={customGoal.target}
                        onChangeText={(text) =>
                          setCustomGoal((prev) => ({ ...prev, target: text.replace(/[^0-9]/g, '') }))
                        }
                        keyboardType="numeric"
                        className="flex-1 text-2xl font-bold text-sage-900 text-center mx-3"
                        returnKeyType="next"
                      />
                      <Pressable
                        onPress={() => {
                          const current = parseInt(customGoal.target) || 0;
                          setCustomGoal((prev) => ({ ...prev, target: String(current + 1) }));
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        className="w-12 h-12 rounded-xl bg-sage-100 items-center justify-center"
                      >
                        <Text className="text-xl font-bold text-sage-700">+</Text>
                      </Pressable>
                    </View>

                    {/* Unit Suggestions */}
                    <Text className="text-xs font-medium text-sage-500 mb-2">UNIT</Text>
                    <View className="flex-row flex-wrap mb-3">
                      {["minutes", "glasses", "pages", "times", "hours", "sessions"].map((unit) => (
                        <Pressable
                          key={unit}
                          onPress={() => {
                            setCustomGoal((prev) => ({ ...prev, unit }));
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          className={`mr-2 mb-2 px-4 py-2 rounded-full ${customGoal.unit === unit ? "bg-sage-500" : "bg-sage-50"
                            }`}
                        >
                          <Text
                            className={`text-sm ${customGoal.unit === unit
                              ? "text-white font-medium"
                              : "text-sage-700"
                              }`}
                          >
                            {unit}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <TextInput
                      placeholder="Or type custom unit..."
                      placeholderTextColor="#94a67e"
                      selectionColor="#5c6e4a"
                      value={customGoal.unit}
                      onChangeText={(text) =>
                        setCustomGoal((prev) => ({ ...prev, unit: text }))
                      }
                      className="text-base text-sage-900 border-b border-sage-100 pb-3 mb-4"
                      returnKeyType="done"
                      onSubmitEditing={handleAddCustom}
                    />

                    <Pressable
                      onPress={handleAddCustom}
                      className="bg-sage-500 rounded-xl py-4 flex-row items-center justify-center"
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                    >
                      <Plus size={20} color="white" />
                      <Text className="text-white font-semibold ml-2 text-base">
                        Add Goal
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>



      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-cream rounded-3xl p-6 w-full max-w-sm">
            <View className="items-center mb-5">
              <View className="w-16 h-16 rounded-2xl bg-red-50 items-center justify-center mb-3">
                <Trash2 size={32} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-sage-900 text-center">
                Delete Goal?
              </Text>
              <Text className="text-sm text-sage-600 text-center mt-2">
                Are you sure you want to delete{" "}
                <Text className="font-semibold">{goalToDelete?.name}</Text>? This action cannot be undone.
              </Text>
            </View>

            <View className="flex-row mt-2">
              <Pressable
                onPress={handleCancelDelete}
                className="flex-1 py-3 mr-2 rounded-xl bg-sage-100"
              >
                <Text className="text-sage-700 font-semibold text-center">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmDelete}
                className="flex-1 py-3 ml-2 rounded-xl bg-red-500"
              >
                <Text className="text-white font-semibold text-center">
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-black/40 justify-end">
              <View className="bg-cream rounded-t-3xl pt-6 pb-10 px-5">
                {/* Header with close button */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-sage-900">
                    Edit Goal
                  </Text>
                  <Pressable
                    onPress={handleCancelEdit}
                    className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
                  >
                    <X size={20} color="#49573c" />
                  </Pressable>
                </View>

                {/* Goal Icon Preview */}
                {goalToEdit && (
                  <View className="items-center mb-5">
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                      style={{
                        backgroundColor: (GOAL_PRESETS.find(p => p.type === goalToEdit.type)?.color || "#94a67e") + "20"
                      }}
                    >
                      {(() => {
                        const preset = GOAL_PRESETS.find(p => p.type === goalToEdit.type);
                        const Icon = preset ? ICON_MAP[preset.icon] : Target;
                        return <Icon size={32} color={preset?.color || "#5c6e4a"} />;
                      })()}
                    </View>
                  </View>
                )}

                <View className="bg-white rounded-2xl p-5 mb-4">
                  {/* Goal Name */}
                  <Text className="text-xs font-medium text-sage-500 mb-1">GOAL NAME</Text>
                  <TextInput
                    placeholder="Goal name"
                    placeholderTextColor="#94a67e"
                    selectionColor="#5c6e4a"
                    value={editGoalData.name}
                    onChangeText={(text) =>
                      setEditGoalData((prev) => ({ ...prev, name: text }))
                    }
                    className="text-lg text-sage-900 border-b border-sage-100 pb-3 mb-5"
                    returnKeyType="next"
                  />

                  {/* Target with +/- buttons */}
                  <Text className="text-xs font-medium text-sage-500 mb-1">DAILY TARGET</Text>
                  <View className="flex-row items-center mb-5">
                    <Pressable
                      onPress={() => {
                        const current = parseInt(editGoalData.target) || 0;
                        if (current > 1) {
                          setEditGoalData((prev) => ({ ...prev, target: String(current - 1) }));
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                      className="w-12 h-12 rounded-xl bg-sage-100 items-center justify-center"
                    >
                      <Text className="text-xl font-bold text-sage-700">−</Text>
                    </Pressable>
                    <TextInput
                      placeholder="0"
                      placeholderTextColor="#94a67e"
                      selectionColor="#5c6e4a"
                      value={editGoalData.target}
                      onChangeText={(text) =>
                        setEditGoalData((prev) => ({ ...prev, target: text.replace(/[^0-9]/g, '') }))
                      }
                      keyboardType="numeric"
                      className="flex-1 text-3xl font-bold text-sage-900 text-center mx-3"
                      returnKeyType="next"
                    />
                    <Pressable
                      onPress={() => {
                        const current = parseInt(editGoalData.target) || 0;
                        setEditGoalData((prev) => ({ ...prev, target: String(current + 1) }));
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="w-12 h-12 rounded-xl bg-sage-100 items-center justify-center"
                    >
                      <Text className="text-xl font-bold text-sage-700">+</Text>
                    </Pressable>
                  </View>

                  {/* Unit */}
                  <Text className="text-xs font-medium text-sage-500 mb-1">UNIT</Text>
                  <TextInput
                    placeholder="e.g., minutes, glasses, pages"
                    placeholderTextColor="#94a67e"
                    selectionColor="#5c6e4a"
                    value={editGoalData.unit}
                    onChangeText={(text) =>
                      setEditGoalData((prev) => ({ ...prev, unit: text }))
                    }
                    className="text-base text-sage-900 border-b border-sage-100 pb-3"
                    returnKeyType="done"
                    onSubmitEditing={handleSaveEdit}
                  />
                </View>

                {/* Notification Settings Button */}
                <Pressable
                  onPress={() => {
                    // Close edit modal first to avoid stacked modals (which can cause issues)
                    // State (goalToEdit) is preserved because we don't call setGoalToEdit(null)
                    setShowEditModal(false);
                    setTimeout(() => setShowNotificationModal(true), 300);
                  }}
                  className="bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-xl bg-sage-100 items-center justify-center">
                      <Bell size={20} color="#5c6e4a" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-base font-semibold text-sage-900">Reminders</Text>
                      <Text className="text-sm text-sage-500">
                        {notificationEnabled ? `${formatTimeDisplay(selectedTime)}${useInterval ? ' + repeats' : ''}` : "Off"}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-sage-50 px-3 py-1.5 rounded-full">
                    <Text className="text-xs font-medium text-sage-700">Edit</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleSaveEdit}
                  className="bg-sage-500 rounded-xl py-4 flex-row items-center justify-center"
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <Check size={20} color="white" />
                  <Text className="text-white font-semibold ml-2 text-base">
                    Save Changes
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Notification Setup Modal */}
      <Modal visible={showNotificationModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50">
          {/* Main Notification Settings Card - Centered */}
          <Pressable
            className="flex-1 justify-center items-center px-6"
            onPress={() => {
              // Optional: Close modal on background tap if desired, 
              // but usually we want explicit Save/Skip actions.
            }}
          >
            <TouchableWithoutFeedback>
              <View className="bg-cream rounded-3xl p-6 w-full max-w-sm">
                {/* Header */}
                <View className="items-center mb-5">
                  <View className="w-16 h-16 rounded-2xl bg-sage-100 items-center justify-center mb-3">
                    <Bell size={32} color="#5c6e4a" />
                  </View>
                  <Text className="text-xl font-bold text-sage-900 text-center">
                    Set Up Reminders
                  </Text>
                  <Text className="text-sm text-sage-600 text-center mt-1">
                    Get notified to complete your{" "}
                    <Text className="font-semibold">{newlyAddedGoal?.name || goalToEdit?.name}</Text> goal
                  </Text>
                </View>

                {/* Enable Toggle */}
                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    <Clock size={20} color="#5c6e4a" />
                    <Text className="ml-3 text-base font-medium text-sage-900">
                      Daily Reminder
                    </Text>
                  </View>
                  <Switch
                    value={notificationEnabled}
                    onValueChange={setNotificationEnabled}
                    trackColor={{ false: "#d4dac9", true: "#94a67e" }}
                    thumbColor={notificationEnabled ? "#5c6e4a" : "#f4f4f4"}
                  />
                </View>

                {/* Time Selection */}
                {notificationEnabled && (
                  <>
                    {/* Start/Reminder Time */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-sage-600 mb-2">
                        {useInterval ? "Start Time" : "Reminder Time"}
                      </Text>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setShowStartTimePicker(true);
                        }}
                        className="bg-white rounded-xl p-4 flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center">
                          <Clock size={20} color="#5c6e4a" />
                          <Text className="ml-3 text-base text-sage-900">
                            {formatTimeDisplay(selectedTime)}
                          </Text>
                        </View>
                        <Text className="text-sage-400">Tap to change</Text>
                      </Pressable>
                    </View>

                    {/* Repeat Interval Toggle */}
                    <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center flex-1">
                        <Repeat size={20} color="#5c6e4a" />
                        <Text className="ml-3 text-base font-medium text-sage-900">
                          Repeat During Day
                        </Text>
                      </View>
                      <Switch
                        value={useInterval}
                        onValueChange={setUseInterval}
                        trackColor={{ false: "#d4dac9", true: "#94a67e" }}
                        thumbColor={useInterval ? "#5c6e4a" : "#f4f4f4"}
                      />
                    </View>

                    {/* Interval Settings */}
                    {useInterval && (
                      <>
                        {/* Interval Selection */}
                        <View className="mb-4">
                          <Text className="text-sm font-medium text-sage-600 mb-2">
                            Repeat Interval
                          </Text>
                          <View className="flex-row flex-wrap">
                            {INTERVAL_OPTIONS.map((interval) => (
                              <Pressable
                                key={interval.value}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setIntervalHours(interval.value);
                                }}
                                className={`mr-2 mb-2 px-4 py-3 rounded-xl ${intervalHours === interval.value
                                  ? "bg-sage-500"
                                  : "bg-white"
                                  }`}
                              >
                                <Text
                                  className={`text-sm font-medium ${intervalHours === interval.value
                                    ? "text-white"
                                    : "text-sage-700"
                                    }`}
                                >
                                  {interval.label}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        </View>

                        {/* End Time Selection */}
                        <View className="mb-4">
                          <Text className="text-sm font-medium text-sage-600 mb-2">
                            Stop Reminders At
                          </Text>
                          <Pressable
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setShowEndTimePicker(true);
                            }}
                            className="bg-white rounded-xl p-4 flex-row items-center justify-between"
                          >
                            <View className="flex-row items-center">
                              <Clock size={20} color="#5c6e4a" />
                              <Text className="ml-3 text-base text-sage-900">
                                {formatTimeDisplay(endTime)}
                              </Text>
                            </View>
                            <Text className="text-sage-400">Tap to change</Text>
                          </Pressable>
                        </View>
                      </>
                    )}
                  </>
                )}

                {/* Actions */}
                <View className="flex-row mt-2">
                  <Pressable
                    onPress={handleSkipNotification}
                    className="flex-1 py-3 mr-2 rounded-xl bg-sage-100"
                  >
                    <Text className="text-sage-700 font-semibold text-center">
                      Skip
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSaveNotification}
                    className="flex-1 py-3 ml-2 rounded-xl bg-sage-500"
                  >
                    <Text className="text-white font-semibold text-center">
                      {notificationEnabled ? "Save" : "Done"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Pressable>

          {/* Time Picker Overlay - Start Time */}
          {showStartTimePicker && (
            <View className="absolute inset-0 z-50 justify-end" style={{ zIndex: 100 }}>
              <Pressable
                className="absolute inset-0 bg-black/30"
                onPress={() => setShowStartTimePicker(false)}
              />
              <View className="bg-cream rounded-t-3xl pb-8 max-h-[70%] w-full">
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-sage-100">
                  <Text className="text-lg font-bold text-sage-900">
                    {useInterval ? "Start Time" : "Reminder Time"}
                  </Text>
                  <Pressable
                    onPress={() => setShowStartTimePicker(false)}
                    className="px-4 py-2 bg-sage-100 rounded-full"
                  >
                    <Text className="text-sage-700 font-medium">Done</Text>
                  </Pressable>
                </View>
                <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
                  {["Morning", "Afternoon", "Evening"].map((period) => (
                    <View key={period} className="mb-4">
                      <Text className="text-sm font-medium text-sage-500 mb-2">{period}</Text>
                      <View className="flex-row flex-wrap">
                        {TIME_OPTIONS.filter((t) => t.period === period).map((time) => (
                          <Pressable
                            key={time.value}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setSelectedTime(time.value);
                              // Ensure end time is after start time
                              if (time.value >= endTime) {
                                const newEndIndex = TIME_OPTIONS.findIndex((t) => t.value === time.value);
                                if (newEndIndex < TIME_OPTIONS.length - 1) {
                                  setEndTime(TIME_OPTIONS[Math.min(newEndIndex + 3, TIME_OPTIONS.length - 1)].value);
                                }
                              }
                              setShowStartTimePicker(false);
                            }}
                            className={`mr-2 mb-2 px-4 py-3 rounded-xl ${selectedTime === time.value
                              ? "bg-sage-500"
                              : "bg-white"
                              }`}
                          >
                            <Text
                              className={`text-sm font-medium ${selectedTime === time.value
                                ? "text-white"
                                : "text-sage-700"
                                }`}
                            >
                              {time.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ))}
                  <View className="h-8" />
                </ScrollView>
              </View>
            </View>
          )}

          {/* Time Picker Overlay - End Time */}
          {showEndTimePicker && (
            <View className="absolute inset-0 z-50 justify-end" style={{ zIndex: 100 }}>
              <Pressable
                className="absolute inset-0 bg-black/30"
                onPress={() => setShowEndTimePicker(false)}
              />
              <View className="bg-cream rounded-t-3xl pb-8 max-h-[70%] w-full">
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-sage-100">
                  <Text className="text-lg font-bold text-sage-900">
                    Stop Reminders At
                  </Text>
                  <Pressable
                    onPress={() => setShowEndTimePicker(false)}
                    className="px-4 py-2 bg-sage-100 rounded-full"
                  >
                    <Text className="text-sage-700 font-medium">Done</Text>
                  </Pressable>
                </View>
                <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
                  {["Morning", "Afternoon", "Evening"].map((period) => {
                    const periodTimes = TIME_OPTIONS.filter(
                      (t) => t.period === period && t.value > selectedTime
                    );
                    if (periodTimes.length === 0) return null;
                    return (
                      <View key={period} className="mb-4">
                        <Text className="text-sm font-medium text-sage-500 mb-2">{period}</Text>
                        <View className="flex-row flex-wrap">
                          {periodTimes.map((time) => (
                            <Pressable
                              key={time.value}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setEndTime(time.value);
                                setShowEndTimePicker(false);
                              }}
                              className={`mr-2 mb-2 px-4 py-3 rounded-xl ${endTime === time.value
                                ? "bg-sage-500"
                                : "bg-white"
                                }`}
                            >
                              <Text
                                className={`text-sm font-medium ${endTime === time.value
                                  ? "text-white"
                                  : "text-sage-700"
                                  }`}
                              >
                                {time.label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                  <View className="h-8" />
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
