import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { DailyProgress, JournalEntry, Achievement } from "./store";

export interface ExportData {
  exportDate: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalDays: number;
    totalGoalsCompleted: number;
    totalPointsEarned: number;
    journalEntriesCount: number;
    achievementsUnlocked: number;
  };
  dailyProgress: DailyProgress[];
  journalEntries: Array<{
    date: string;
    mood?: string;
    content: string;
    prompt?: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    progress: number;
    requirement: number;
    unlocked: boolean;
    unlockedAt?: string;
  }>;
  streaks: {
    currentStreak: number;
    longestStreak: number;
  };
}

/**
 * Filter daily progress data by date range
 */
export function filterDailyProgressByDateRange(
  dailyHistory: DailyProgress[],
  startDate: string,
  endDate: string
): DailyProgress[] {
  return dailyHistory.filter((entry) => {
    return entry.date >= startDate && entry.date <= endDate;
  });
}

/**
 * Filter journal entries by date range
 */
export function filterJournalEntriesByDateRange(
  journalEntries: JournalEntry[],
  startDate: string,
  endDate: string
): JournalEntry[] {
  return journalEntries.filter((entry) => {
    const entryDate = entry.date.split("T")[0];
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Prepare export data structure
 */
export function prepareExportData(
  dailyHistory: DailyProgress[],
  journalEntries: JournalEntry[],
  achievements: Achievement[],
  currentStreak: number,
  longestStreak: number,
  startDate: string,
  endDate: string
): ExportData {
  const filteredDailyProgress = filterDailyProgressByDateRange(
    dailyHistory,
    startDate,
    endDate
  );
  const filteredJournalEntries = filterJournalEntriesByDateRange(
    journalEntries,
    startDate,
    endDate
  );

  const totalGoalsCompleted = filteredDailyProgress.reduce(
    (acc, d) => acc + d.goalsCompleted,
    0
  );
  const totalPointsEarned = filteredDailyProgress.reduce(
    (acc, d) => acc + d.pointsEarned,
    0
  );
  const achievementsUnlocked = achievements.filter(
    (a) => a.progress >= a.requirement
  ).length;

  return {
    exportDate: new Date().toISOString(),
    dateRange: {
      start: startDate,
      end: endDate,
    },
    summary: {
      totalDays: filteredDailyProgress.length,
      totalGoalsCompleted,
      totalPointsEarned,
      journalEntriesCount: filteredJournalEntries.length,
      achievementsUnlocked,
    },
    dailyProgress: filteredDailyProgress,
    journalEntries: filteredJournalEntries.map((entry) => ({
      date: entry.date,
      mood: entry.mood,
      content: entry.content,
      prompt: entry.prompt,
    })),
    achievements: achievements.map((a) => ({
      title: a.title,
      description: a.description,
      progress: a.progress,
      requirement: a.requirement,
      unlocked: a.progress >= a.requirement,
      unlockedAt: a.unlockedAt,
    })),
    streaks: {
      currentStreak,
      longestStreak,
    },
  };
}

/**
 * Convert export data to CSV format
 */
export function convertToCSV(data: ExportData): string {
  const lines: string[] = [];

  // Header info
  lines.push("Alma Wellness Data Export");
  lines.push(`Export Date,${data.exportDate}`);
  lines.push(`Date Range,${data.dateRange.start} to ${data.dateRange.end}`);
  lines.push("");

  // Summary section
  lines.push("SUMMARY");
  lines.push(`Total Days Tracked,${data.summary.totalDays}`);
  lines.push(`Total Goals Completed,${data.summary.totalGoalsCompleted}`);
  lines.push(`Total Points Earned,${data.summary.totalPointsEarned}`);
  lines.push(`Journal Entries,${data.summary.journalEntriesCount}`);
  lines.push(`Achievements Unlocked,${data.summary.achievementsUnlocked}`);
  lines.push(`Current Streak,${data.streaks.currentStreak}`);
  lines.push(`Longest Streak,${data.streaks.longestStreak}`);
  lines.push("");

  // Daily Progress section
  lines.push("DAILY PROGRESS");
  lines.push("Date,Goals Completed,Total Goals,Points Earned");
  data.dailyProgress.forEach((day) => {
    lines.push(
      `${day.date},${day.goalsCompleted},${day.totalGoals},${day.pointsEarned}`
    );
  });
  lines.push("");

  // Journal Entries section
  lines.push("JOURNAL ENTRIES");
  lines.push("Date,Mood,Prompt,Content");
  data.journalEntries.forEach((entry) => {
    const content = entry.content.replace(/"/g, '""').replace(/\n/g, " ");
    const prompt = (entry.prompt || "").replace(/"/g, '""');
    lines.push(`${entry.date},${entry.mood || ""},\"${prompt}\",\"${content}\"`);
  });
  lines.push("");

  // Achievements section
  lines.push("ACHIEVEMENTS");
  lines.push("Title,Description,Progress,Requirement,Unlocked,Unlocked At");
  data.achievements.forEach((ach) => {
    lines.push(
      `${ach.title},${ach.description},${ach.progress},${ach.requirement},${ach.unlocked},${ach.unlockedAt || ""}`
    );
  });

  return lines.join("\n");
}

/**
 * Export data to a file and share it
 */
export async function exportAndShare(
  data: ExportData,
  format: "json" | "csv"
): Promise<boolean> {
  try {
    const fileName = `alma-wellness-export-${data.dateRange.start}-to-${data.dateRange.end}.${format}`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    let content: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
    } else {
      content = convertToCSV(data);
      mimeType = "text/csv";
    }

    await FileSystem.writeAsStringAsync(filePath, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn("Sharing is not available on this device");
      return false;
    }

    await Sharing.shareAsync(filePath, {
      mimeType,
      dialogTitle: "Export Alma Wellness Data",
      UTI: format === "json" ? "public.json" : "public.comma-separated-values-text",
    });

    return true;
  } catch (error) {
    console.error("Export failed:", error);
    return false;
  }
}
