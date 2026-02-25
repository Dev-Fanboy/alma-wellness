import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  BookHeart,
  Calendar,
  Heart,
  Smile,
  Meh,
  Frown,
  X,
  Plus,
} from "lucide-react-native";
import { useWellnessStore, JournalEntry } from "@/lib/store";

const MOOD_ICONS = {
  great: { icon: Heart, color: "#94a67e", bg: "#f0f4eb" },
  good: { icon: Smile, color: "#7fb3d3", bg: "#e8f4fa" },
  okay: { icon: Meh, color: "#c4a7e7", bg: "#f5f0fa" },
  low: { icon: Frown, color: "#e7a7b8", bg: "#fdf0f4" },
};

export default function JournalHistoryScreen() {
  const router = useRouter();
  const journalEntries = useWellnessStore((s) => s.journalEntries);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNewEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/journal");
  };

  const handleEntryPress = (entry: JournalEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEntry(entry);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Group entries by month as SectionList sections
  const sections = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {};
    for (const entry of journalEntries) {
      const date = new Date(entry.date);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(entry);
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [journalEntries]);

  // Render a single journal entry card
  const renderEntry = useCallback(({ item: entry }: { item: JournalEntry }) => {
    const moodData = entry.mood ? MOOD_ICONS[entry.mood] : null;
    const MoodIcon = moodData?.icon;

    return (
      <Pressable
        onPress={() => handleEntryPress(entry)}
        className="bg-white rounded-2xl p-4 mb-2 mx-5"
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-sage-700">
            {formatShortDate(entry.date)}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-sage-400 mr-2">
              {formatTime(entry.date)}
            </Text>
            {moodData && MoodIcon && (
              <View
                className="rounded-full px-2 py-1 flex-row items-center"
                style={{ backgroundColor: moodData.bg }}
              >
                <MoodIcon size={12} color={moodData.color} />
                <Text
                  className="text-xs ml-1 capitalize font-medium"
                  style={{ color: moodData.color }}
                >
                  {entry.mood}
                </Text>
              </View>
            )}
          </View>
        </View>

        {entry.prompt && (
          <Text className="text-xs text-sage-400 italic mb-1">
            "{entry.prompt}"
          </Text>
        )}

        <Text
          className="text-sage-800 text-sm leading-relaxed"
          numberOfLines={3}
        >
          {entry.content}
        </Text>
      </Pressable>
    );
  }, []);

  // Render section header (month group)
  const renderSectionHeader = useCallback(({ section }: { section: { title: string; data: JournalEntry[] } }) => (
    <View className="flex-row items-center px-5 mb-2 mt-2">
      <Calendar size={14} color="#94a67e" />
      <Text className="ml-2 text-sm font-medium text-sage-600">
        {section.title}
      </Text>
      <Text className="ml-2 text-xs text-sage-400">
        ({section.data.length} {section.data.length === 1 ? "entry" : "entries"})
      </Text>
    </View>
  ), []);

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
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
          >
            <ArrowLeft size={20} color="#49573c" />
          </Pressable>
          <View className="flex-row items-center">
            <BookHeart size={22} color="#49573c" />
            <Text className="ml-2 text-lg font-semibold text-sage-900">
              Journal History
            </Text>
          </View>
          <Pressable
            onPress={handleNewEntry}
            className="w-10 h-10 rounded-full bg-sage-500 items-center justify-center"
          >
            <Plus size={20} color="white" />
          </Pressable>
        </View>

        {journalEntries.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10">
            <View className="w-20 h-20 rounded-full bg-sage-100 items-center justify-center mb-4">
              <BookHeart size={40} color="#94a67e" />
            </View>
            <Text className="text-xl font-semibold text-sage-900 text-center mb-2">
              No Journal Entries Yet
            </Text>
            <Text className="text-sage-600 text-center mb-6">
              Start documenting your wellness journey by writing your first
              entry.
            </Text>
            <Pressable
              onPress={handleNewEntry}
              className="bg-sage-500 rounded-2xl px-6 py-3"
            >
              <Text className="text-white font-semibold">
                Write First Entry
              </Text>
            </Pressable>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderEntry}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            ListHeaderComponent={
              <Animated.View
                entering={FadeInDown.delay(100).duration(500)}
                className="mx-5 mb-4"
              >
                <View className="bg-white rounded-2xl p-4 flex-row">
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-sage-800">
                      {journalEntries.length}
                    </Text>
                    <Text className="text-xs text-sage-500">Total Entries</Text>
                  </View>
                  <View className="w-px bg-sage-100" />
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-sage-800">
                      {
                        new Set(
                          journalEntries.map((e) =>
                            new Date(e.date).toDateString()
                          )
                        ).size
                      }
                    </Text>
                    <Text className="text-xs text-sage-500">Days Journaled</Text>
                  </View>
                  <View className="w-px bg-sage-100" />
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-sage-800">
                      {
                        journalEntries.filter((e) => e.mood === "great").length
                      }
                    </Text>
                    <Text className="text-xs text-sage-500">Great Days</Text>
                  </View>
                </View>
              </Animated.View>
            }
          />
        )}
      </SafeAreaView>

      {/* Entry Detail Modal */}
      <Modal visible={!!selectedEntry} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-cream rounded-t-3xl pt-6 pb-10 px-5 max-h-[80%]">
            {/* Handle */}
            <View className="w-10 h-1 bg-sage-300 rounded-full self-center mb-4" />

            {selectedEntry && (
              <>
                {/* Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-lg font-bold text-sage-900">
                      {formatDate(selectedEntry.date)}
                    </Text>
                    <Text className="text-sm text-sage-500">
                      {formatTime(selectedEntry.date)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSelectedEntry(null)}
                    className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
                  >
                    <X size={20} color="#49573c" />
                  </Pressable>
                </View>

                {/* Mood Badge */}
                {selectedEntry.mood && (
                  <View className="mb-4">
                    {(() => {
                      const moodData = MOOD_ICONS[selectedEntry.mood];
                      const MoodIcon = moodData.icon;
                      return (
                        <View
                          className="self-start rounded-full px-4 py-2 flex-row items-center"
                          style={{ backgroundColor: moodData.bg }}
                        >
                          <MoodIcon size={18} color={moodData.color} />
                          <Text
                            className="ml-2 font-medium capitalize"
                            style={{ color: moodData.color }}
                          >
                            Feeling {selectedEntry.mood}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                )}

                {/* Prompt */}
                {selectedEntry.prompt && (
                  <View className="bg-sage-100 rounded-xl p-3 mb-4">
                    <Text className="text-xs text-sage-500 mb-1">Prompt</Text>
                    <Text className="text-sage-700 font-medium">
                      {selectedEntry.prompt}
                    </Text>
                  </View>
                )}

                {/* Content */}
                <ScrollView
                  className="bg-white rounded-2xl p-4"
                  style={{ maxHeight: 300 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text className="text-sage-800 text-base leading-relaxed">
                    {selectedEntry.content}
                  </Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
