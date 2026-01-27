import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Modal, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
    Download,
    Calendar,
    FileJson,
    FileSpreadsheet,
    ChevronLeft,
    Check,
    Loader,
    FileText,
    BookHeart,
    Trophy,
    Flame,
} from "lucide-react-native";
import { useWellnessStore } from "@/lib/store";
import {
    prepareExportData,
    exportAndShare,
    filterDailyProgressByDateRange,
    filterJournalEntriesByDateRange,
} from "@/lib/export";
import { playSuccess } from "@/lib/sounds";

type ExportFormat = "json" | "csv";

export default function ExportDataScreen() {
    const dailyHistory = useWellnessStore((s) => s.dailyHistory);
    const journalEntries = useWellnessStore((s) => s.journalEntries);
    const achievements = useWellnessStore((s) => s.achievements);
    const currentStreak = useWellnessStore((s) => s.currentStreak);
    const longestStreak = useWellnessStore((s) => s.longestStreak);

    // Date range state - default to last 30 days
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());

    // Date picker visibility
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Format selection
    const [format, setFormat] = useState<ExportFormat>("json");

    // Export state
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    // Format dates for display and filtering
    const formatDateDisplay = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatDateISO = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    // Calculate preview stats
    const previewStats = useMemo(() => {
        const startStr = formatDateISO(startDate);
        const endStr = formatDateISO(endDate);

        const filteredDays = filterDailyProgressByDateRange(
            dailyHistory,
            startStr,
            endStr
        );
        const filteredJournals = filterJournalEntriesByDateRange(
            journalEntries,
            startStr,
            endStr
        );
        const unlockedAchievements = achievements.filter(
            (a) => a.progress >= a.requirement
        ).length;

        return {
            daysTracked: filteredDays.length,
            journalEntries: filteredJournals.length,
            achievements: unlockedAchievements,
        };
    }, [startDate, endDate, dailyHistory, journalEntries, achievements]);

    const handleStartDateChange = (_event: unknown, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === "ios");
        if (selectedDate) {
            // Ensure start date doesn't exceed end date
            if (selectedDate > endDate) {
                setEndDate(selectedDate);
            }
            setStartDate(selectedDate);
        }
    };

    const handleEndDateChange = (_event: unknown, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === "ios");
        if (selectedDate) {
            // Ensure end date isn't before start date
            if (selectedDate < startDate) {
                setStartDate(selectedDate);
            }
            setEndDate(selectedDate);
        }
    };

    const handleExport = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsExporting(true);
        setExportSuccess(false);

        try {
            const exportData = prepareExportData(
                dailyHistory,
                journalEntries,
                achievements,
                currentStreak,
                longestStreak,
                formatDateISO(startDate),
                formatDateISO(endDate)
            );

            const success = await exportAndShare(exportData, format);

            if (success) {
                setExportSuccess(true);
                playSuccess();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // Reset success state after 3 seconds
                setTimeout(() => setExportSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Export error:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View className="flex-1 bg-cream">
            <LinearGradient
                colors={["#d4dac9", "#e8ebe3", "#fdfbf7"]}
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 300,
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
                        className="px-5 pt-2 flex-row items-center"
                    >
                        <Pressable
                            onPress={handleBack}
                            className="w-10 h-10 rounded-full bg-white/80 items-center justify-center mr-3"
                        >
                            <ChevronLeft size={24} color="#778b5f" />
                        </Pressable>
                        <View>
                            <Text className="text-2xl font-bold text-sage-900">
                                Export Data
                            </Text>
                            <Text className="text-sm text-sage-600">
                                Download your wellness history
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Date Range Selection */}
                    <Animated.View
                        entering={FadeInUp.delay(200).duration(600)}
                        className="mx-5 mt-6"
                    >
                        <View className="flex-row items-center mb-3">
                            <Calendar size={18} color="#778b5f" />
                            <Text className="ml-2 text-base font-semibold text-sage-900">
                                Date Range
                            </Text>
                        </View>

                        <View className="bg-white rounded-2xl overflow-hidden">
                            {/* Start Date */}
                            <Pressable
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setShowStartPicker(true);
                                }}
                                className="flex-row items-center justify-between p-4 border-b border-sage-50"
                            >
                                <Text className="text-base text-sage-700">Start Date</Text>
                                <Text className="text-base font-medium text-sage-900">
                                    {formatDateDisplay(startDate)}
                                </Text>
                            </Pressable>

                            {/* End Date */}
                            <Pressable
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setShowEndPicker(true);
                                }}
                                className="flex-row items-center justify-between p-4"
                            >
                                <Text className="text-base text-sage-700">End Date</Text>
                                <Text className="text-base font-medium text-sage-900">
                                    {formatDateDisplay(endDate)}
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>

                    {/* Format Selection */}
                    <Animated.View
                        entering={FadeInUp.delay(300).duration(600)}
                        className="mx-5 mt-6"
                    >
                        <View className="flex-row items-center mb-3">
                            <FileText size={18} color="#778b5f" />
                            <Text className="ml-2 text-base font-semibold text-sage-900">
                                Export Format
                            </Text>
                        </View>

                        <View className="flex-row">
                            {/* JSON Option */}
                            <Pressable
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setFormat("json");
                                }}
                                className={`flex-1 mr-2 p-4 rounded-2xl border-2 ${format === "json"
                                        ? "bg-sage-50 border-sage-500"
                                        : "bg-white border-transparent"
                                    }`}
                            >
                                <View className="flex-row items-center justify-between">
                                    <FileJson
                                        size={24}
                                        color={format === "json" ? "#778b5f" : "#b5c1a5"}
                                    />
                                    {format === "json" && (
                                        <View className="w-5 h-5 rounded-full bg-sage-500 items-center justify-center">
                                            <Check size={12} color="white" />
                                        </View>
                                    )}
                                </View>
                                <Text
                                    className={`text-base font-semibold mt-2 ${format === "json" ? "text-sage-900" : "text-sage-500"
                                        }`}
                                >
                                    JSON
                                </Text>
                                <Text className="text-xs text-sage-500 mt-1">
                                    Structured data format
                                </Text>
                            </Pressable>

                            {/* CSV Option */}
                            <Pressable
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setFormat("csv");
                                }}
                                className={`flex-1 ml-2 p-4 rounded-2xl border-2 ${format === "csv"
                                        ? "bg-sage-50 border-sage-500"
                                        : "bg-white border-transparent"
                                    }`}
                            >
                                <View className="flex-row items-center justify-between">
                                    <FileSpreadsheet
                                        size={24}
                                        color={format === "csv" ? "#778b5f" : "#b5c1a5"}
                                    />
                                    {format === "csv" && (
                                        <View className="w-5 h-5 rounded-full bg-sage-500 items-center justify-center">
                                            <Check size={12} color="white" />
                                        </View>
                                    )}
                                </View>
                                <Text
                                    className={`text-base font-semibold mt-2 ${format === "csv" ? "text-sage-900" : "text-sage-500"
                                        }`}
                                >
                                    CSV
                                </Text>
                                <Text className="text-xs text-sage-500 mt-1">
                                    Spreadsheet compatible
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>

                    {/* Export Preview */}
                    <Animated.View
                        entering={FadeInUp.delay(400).duration(600)}
                        className="mx-5 mt-6"
                    >
                        <Text className="text-base font-semibold text-sage-900 mb-3">
                            Export Preview
                        </Text>

                        <View className="bg-white rounded-2xl p-4">
                            <View className="flex-row">
                                <View className="flex-1 items-center py-2">
                                    <View className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center mb-2">
                                        <FileText size={20} color="#778b5f" />
                                    </View>
                                    <Text className="text-xl font-bold text-sage-900">
                                        {previewStats.daysTracked}
                                    </Text>
                                    <Text className="text-xs text-sage-500">Days Tracked</Text>
                                </View>
                                <View className="w-px bg-sage-100" />
                                <View className="flex-1 items-center py-2">
                                    <View className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center mb-2">
                                        <BookHeart size={20} color="#778b5f" />
                                    </View>
                                    <Text className="text-xl font-bold text-sage-900">
                                        {previewStats.journalEntries}
                                    </Text>
                                    <Text className="text-xs text-sage-500">Journal Entries</Text>
                                </View>
                                <View className="w-px bg-sage-100" />
                                <View className="flex-1 items-center py-2">
                                    <View className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center mb-2">
                                        <Trophy size={20} color="#778b5f" />
                                    </View>
                                    <Text className="text-xl font-bold text-sage-900">
                                        {previewStats.achievements}
                                    </Text>
                                    <Text className="text-xs text-sage-500">Achievements</Text>
                                </View>
                            </View>

                            {/* Streak info */}
                            <View className="mt-4 pt-4 border-t border-sage-100 flex-row items-center justify-center">
                                <Flame size={16} color="#f97316" />
                                <Text className="text-sm text-sage-600 ml-2">
                                    Current streak: {currentStreak} • Longest: {longestStreak}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Export Button */}
                    <Animated.View
                        entering={FadeInUp.delay(500).duration(600)}
                        className="mx-5 mt-8"
                    >
                        <Pressable
                            onPress={handleExport}
                            disabled={isExporting}
                            className={`py-4 rounded-2xl flex-row items-center justify-center ${exportSuccess ? "bg-green-500" : "bg-sage-500"
                                } ${isExporting ? "opacity-70" : ""}`}
                        >
                            {isExporting ? (
                                <>
                                    <Loader size={20} color="white" />
                                    <Text className="text-white font-semibold text-base ml-2">
                                        Exporting...
                                    </Text>
                                </>
                            ) : exportSuccess ? (
                                <>
                                    <Check size={20} color="white" />
                                    <Text className="text-white font-semibold text-base ml-2">
                                        Exported Successfully!
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Download size={20} color="white" />
                                    <Text className="text-white font-semibold text-base ml-2">
                                        Export {format.toUpperCase()} File
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </Animated.View>

                    {/* Help Text */}
                    <Animated.View
                        entering={FadeInUp.delay(600).duration(600)}
                        className="mx-5 mt-4"
                    >
                        <Text className="text-xs text-sage-500 text-center">
                            Your data will be saved to a file that you can share,{"\n"}
                            save to Files, or send via email.
                        </Text>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>

            {/* Start Date Picker Modal (Android) */}
            {showStartPicker && Platform.OS === "android" && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                    maximumDate={new Date()}
                />
            )}

            {/* End Date Picker Modal (Android) */}
            {showEndPicker && Platform.OS === "android" && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                    maximumDate={new Date()}
                />
            )}

            {/* iOS Date Picker Modals */}
            {Platform.OS === "ios" && (
                <>
                    <Modal visible={showStartPicker} transparent animationType="slide">
                        <Pressable
                            className="flex-1 bg-black/30"
                            onPress={() => setShowStartPicker(false)}
                        />
                        <View className="bg-white pb-8">
                            <View className="flex-row items-center justify-between px-4 py-3 border-b border-sage-100">
                                <Text className="text-base font-semibold text-sage-900">
                                    Start Date
                                </Text>
                                <Pressable
                                    onPress={() => setShowStartPicker(false)}
                                    className="px-4 py-2"
                                >
                                    <Text className="text-sage-500 font-medium">Done</Text>
                                </Pressable>
                            </View>
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="spinner"
                                onChange={handleStartDateChange}
                                maximumDate={new Date()}
                                style={{ height: 200 }}
                            />
                        </View>
                    </Modal>

                    <Modal visible={showEndPicker} transparent animationType="slide">
                        <Pressable
                            className="flex-1 bg-black/30"
                            onPress={() => setShowEndPicker(false)}
                        />
                        <View className="bg-white pb-8">
                            <View className="flex-row items-center justify-between px-4 py-3 border-b border-sage-100">
                                <Text className="text-base font-semibold text-sage-900">
                                    End Date
                                </Text>
                                <Pressable
                                    onPress={() => setShowEndPicker(false)}
                                    className="px-4 py-2"
                                >
                                    <Text className="text-sage-500 font-medium">Done</Text>
                                </Pressable>
                            </View>
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="spinner"
                                onChange={handleEndDateChange}
                                maximumDate={new Date()}
                                style={{ height: 200 }}
                            />
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
}
