import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Bell,
  ChevronLeft,
  Clock,
  Calendar,
  Target,
  Check,
} from "lucide-react-native";
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  scheduleDailyReminder,
  cancelDailyReminder,
  requestNotificationPermissions,
} from "@/lib/notifications";

const TIME_OPTIONS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "18:00",
  "20:00",
  "21:00",
];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    dailyReminder: true,
    dailyReminderTime: "09:00",
    retreatReminders: true,
    goalReminders: true,
    goalSpecificReminders: [],
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const stored = await getNotificationSettings();
    setSettings(stored);
    const permission = await requestNotificationPermissions();
    setHasPermission(permission);
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);

    // Update scheduled notifications
    if (newSettings.enabled && newSettings.dailyReminder) {
      await scheduleDailyReminder(newSettings.dailyReminderTime);
    } else {
      await cancelDailyReminder();
    }
  };

  const selectTime = async (time: string) => {
    await updateSettings({ dailyReminderTime: time });
    setShowTimePicker(false);
  };

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={["#e8ebe3", "#fdfbf7", "#fdfbf7"]}
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
            className="px-5 pt-2"
          >
            <View className="flex-row items-center">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                className="w-10 h-10 rounded-full bg-white/80 items-center justify-center mr-3"
              >
                <ChevronLeft size={24} color="#49573c" />
              </Pressable>
              <View>
                <Text className="text-2xl font-bold text-sage-900">
                  Notifications
                </Text>
                <Text className="text-sm text-sage-600">
                  Customize your reminders
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Permission Warning */}
          {!hasPermission && (
            <Animated.View
              entering={FadeInUp.delay(150).duration(500)}
              className="mx-5 mt-6 bg-orange-50 rounded-2xl p-4 border border-orange-200"
            >
              <Text className="text-orange-800 font-medium">
                Notifications are disabled
              </Text>
              <Text className="text-orange-600 text-sm mt-1">
                Enable notifications in your device settings to receive
                reminders.
              </Text>
            </Animated.View>
          )}

          {/* Main Toggle */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            className="mx-5 mt-6"
          >
            <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-sage-100 items-center justify-center">
                  <Bell size={20} color="#5c6e4a" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-sage-900">
                    Enable Notifications
                  </Text>
                  <Text className="text-sm text-sage-500">
                    Get reminders to help you stay on track
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSettings({ enabled: value })}
                trackColor={{ false: "#d4dac9", true: "#94a67e" }}
                thumbColor={settings.enabled ? "#5c6e4a" : "#f4f4f4"}
              />
            </View>
          </Animated.View>

          {/* Notification Types */}
          {settings.enabled && (
            <Animated.View
              entering={FadeInUp.delay(300).duration(500)}
              className="mx-5 mt-4"
            >
              <Text className="text-sm font-semibold text-sage-600 mb-3 ml-1">
                REMINDER TYPES
              </Text>

              {/* Daily Reminder */}
              <View className="bg-white rounded-2xl overflow-hidden mb-3">
                <View className="p-4 flex-row items-center justify-between border-b border-sage-50">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                      <Clock size={20} color="#7fb3d3" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-medium text-sage-900">
                        Daily Reminder
                      </Text>
                      <Text className="text-sm text-sage-500">
                        Start your day with intention
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.dailyReminder}
                    onValueChange={(value) =>
                      updateSettings({ dailyReminder: value })
                    }
                    trackColor={{ false: "#d4dac9", true: "#94a67e" }}
                    thumbColor={settings.dailyReminder ? "#5c6e4a" : "#f4f4f4"}
                  />
                </View>

                {/* Time Picker */}
                {settings.dailyReminder && (
                  <Pressable
                    onPress={() => setShowTimePicker(!showTimePicker)}
                    className="p-4 flex-row items-center justify-between"
                  >
                    <Text className="text-sage-700">Reminder Time</Text>
                    <View className="flex-row items-center">
                      <Text className="text-sage-900 font-medium mr-2">
                        {formatTime(settings.dailyReminderTime)}
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* Time Options */}
                {showTimePicker && settings.dailyReminder && (
                  <View className="px-4 pb-4">
                    <View className="flex-row flex-wrap">
                      {TIME_OPTIONS.map((time) => (
                        <Pressable
                          key={time}
                          onPress={() => selectTime(time)}
                          className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                            settings.dailyReminderTime === time
                              ? "bg-sage-500"
                              : "bg-sage-100"
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              settings.dailyReminderTime === time
                                ? "text-white font-medium"
                                : "text-sage-700"
                            }`}
                          >
                            {formatTime(time)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Retreat Reminders */}
              <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
                    <Calendar size={20} color="#c4a7e7" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-medium text-sage-900">
                      Retreat Reminders
                    </Text>
                    <Text className="text-sm text-sage-500">
                      Get notified before events
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.retreatReminders}
                  onValueChange={(value) =>
                    updateSettings({ retreatReminders: value })
                  }
                  trackColor={{ false: "#d4dac9", true: "#94a67e" }}
                  thumbColor={settings.retreatReminders ? "#5c6e4a" : "#f4f4f4"}
                />
              </View>

              {/* Goal Reminders */}
              <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-pink-50 items-center justify-center">
                    <Target size={20} color="#e7a7b8" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-medium text-sage-900">
                      Goal Reminders
                    </Text>
                    <Text className="text-sm text-sage-500">
                      Nudges to complete your goals
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.goalReminders}
                  onValueChange={(value) =>
                    updateSettings({ goalReminders: value })
                  }
                  trackColor={{ false: "#d4dac9", true: "#94a67e" }}
                  thumbColor={settings.goalReminders ? "#5c6e4a" : "#f4f4f4"}
                />
              </View>
            </Animated.View>
          )}

          {/* Info */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            className="mx-5 mt-6 bg-sage-50 rounded-2xl p-4"
          >
            <Text className="text-sage-700 text-sm leading-relaxed">
              Notifications help you build consistent wellness habits. We'll
              never send you more than a few gentle reminders per day.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
