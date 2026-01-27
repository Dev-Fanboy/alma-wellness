import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_SETTINGS_KEY = "alma-notification-settings";

export interface GoalNotificationSetting {
  goalId: string;
  goalName: string;
  enabled: boolean;
  reminderTime: string; // "HH:MM" format - start time
  useInterval: boolean; // Whether to use interval-based reminders
  intervalHours: number; // Hours between reminders (e.g., 4 for every 4 hours)
  endTime: string; // "HH:MM" format - stop reminders after this time
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // "HH:MM" format
  retreatReminders: boolean;
  goalReminders: boolean;
  goalSpecificReminders: GoalNotificationSetting[];
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyReminder: true,
  dailyReminderTime: "09:00",
  retreatReminders: true,
  goalReminders: true,
  goalSpecificReminders: [],
};

// Motivational messages for goal reminders
const MOTIVATIONAL_MESSAGES: string[] = [
  "You've got this! Every step counts.",
  "Small progress is still progress.",
  "Your future self will thank you.",
  "Consistency beats perfection.",
  "One goal at a time, one day at a time.",
  "You're stronger than you think.",
  "Make today count!",
  "Your plant is cheering you on!",
  "Keep going, you're doing amazing!",
  "Today's effort is tomorrow's strength.",
  "Believe in your journey.",
  "You're building something beautiful.",
  "Every healthy choice matters.",
  "Your wellness journey starts now.",
  "Be proud of every small win.",
  "You're capable of incredible things.",
  "Take care of yourself today.",
  "Progress, not perfection.",
  "Your commitment inspires growth.",
  "Embrace the journey, celebrate the wins.",
  "Little by little, day by day.",
  "You're worth the effort.",
  "Keep nurturing your goals!",
  "Today is full of possibilities.",
  "Your dedication is paying off.",
];

function getRandomMotivationalMessage(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Error reading settings - use defaults
  }
  return DEFAULT_SETTINGS;
}

export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // Error saving settings - silently ignore
  }
}

export async function scheduleDailyReminder(time: string): Promise<void> {
  // Cancel existing daily reminders first
  await cancelDailyReminder();

  const [hours, minutes] = time.split(":").map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good morning! 🌱",
      body: "Time to nurture your wellness goals. Your plant is waiting!",
      data: { type: "daily-reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const dailyReminders = notifications.filter(
    (n) => n.content.data?.type === "daily-reminder"
  );

  for (const reminder of dailyReminders) {
    await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
  }
}

export async function scheduleGoalReminder(
  goalName: string,
  delaySeconds: number = 3600
): Promise<string> {
  const motivationalMessage = getRandomMotivationalMessage();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${goalName} Reminder`,
      body: `${motivationalMessage}`,
      data: { type: "goal-reminder", goalName },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
    },
  });
  return id;
}

export async function scheduleDailyGoalReminder(
  goalId: string,
  goalName: string,
  time: string
): Promise<void> {
  // Cancel any existing reminder for this goal
  await cancelGoalSpecificReminder(goalId);

  const [hours, minutes] = time.split(":").map(Number);
  const motivationalMessage = getRandomMotivationalMessage();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${goalName} Reminder`,
      body: motivationalMessage,
      data: { type: "goal-specific-reminder", goalId, goalName },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

export async function scheduleIntervalGoalReminders(
  goalId: string,
  goalName: string,
  startTime: string,
  endTime: string,
  intervalHours: number
): Promise<void> {
  // Cancel any existing reminders for this goal
  await cancelGoalSpecificReminder(goalId);

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  // Calculate all reminder times between start and end
  let currentHour = startHours;
  let currentMinute = startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  while (currentHour * 60 + currentMinute <= endTotalMinutes) {
    const motivationalMessage = getRandomMotivationalMessage();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${goalName} Reminder`,
        body: motivationalMessage,
        data: { type: "goal-specific-reminder", goalId, goalName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: currentHour,
        minute: currentMinute,
      },
    });

    // Add interval hours
    currentHour += intervalHours;
  }
}

export async function cancelGoalSpecificReminder(goalId: string): Promise<void> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const goalReminders = notifications.filter(
    (n) => n.content.data?.type === "goal-specific-reminder" && n.content.data?.goalId === goalId
  );

  for (const reminder of goalReminders) {
    await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
  }
}

export async function saveGoalNotificationSetting(
  setting: GoalNotificationSetting
): Promise<void> {
  const settings = await getNotificationSettings();
  const existingIndex = settings.goalSpecificReminders.findIndex(
    (s) => s.goalId === setting.goalId
  );

  if (existingIndex >= 0) {
    settings.goalSpecificReminders[existingIndex] = setting;
  } else {
    settings.goalSpecificReminders.push(setting);
  }

  await saveNotificationSettings(settings);

  // Schedule or cancel the notification based on the setting
  if (setting.enabled && settings.enabled) {
    if (setting.useInterval) {
      await scheduleIntervalGoalReminders(
        setting.goalId,
        setting.goalName,
        setting.reminderTime,
        setting.endTime,
        setting.intervalHours
      );
    } else {
      await scheduleDailyGoalReminder(setting.goalId, setting.goalName, setting.reminderTime);
    }
  } else {
    await cancelGoalSpecificReminder(setting.goalId);
  }
}

export async function removeGoalNotificationSetting(goalId: string): Promise<void> {
  const settings = await getNotificationSettings();
  settings.goalSpecificReminders = settings.goalSpecificReminders.filter(
    (s) => s.goalId !== goalId
  );
  await saveNotificationSettings(settings);
  await cancelGoalSpecificReminder(goalId);
}

export async function scheduleRetreatReminder(
  retreatTitle: string,
  retreatDate: Date
): Promise<string | null> {
  // Schedule reminder for 1 day before
  const reminderDate = new Date(retreatDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(10, 0, 0, 0);

  // Don't schedule if the date is in the past
  if (reminderDate <= new Date()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Retreat Tomorrow! 📅",
      body: `Don't forget: "${retreatTitle}" is happening tomorrow!`,
      data: { type: "retreat-reminder", retreatTitle },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
  return id;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function initializeNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    return;
  }

  const settings = await getNotificationSettings();

  if (settings.enabled && settings.dailyReminder) {
    await scheduleDailyReminder(settings.dailyReminderTime);
  }
}

// Optimization: Smart Defaults for Goal Notifications
export async function applySmartDefaults(goals: any[]): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  for (const goal of goals) {
    let setting: GoalNotificationSetting = {
      goalId: goal.id,
      goalName: goal.name,
      enabled: true,
      reminderTime: "09:00", // Default fallback
      useInterval: false,
      intervalHours: 4,
      endTime: "20:00",
    };

    switch (goal.type) {
      case "hydration":
        // Hydration: Every 4 hours starting at 10am
        setting.reminderTime = "10:00";
        setting.useInterval = true;
        setting.intervalHours = 4;
        break;
      case "meditation":
        // Meditation: Morning start
        setting.reminderTime = "08:00";
        break;
      case "walking":
        // Walking: Lunch break
        setting.reminderTime = "12:00";
        break;
      case "journaling":
        // Journaling: Evening reflection
        setting.reminderTime = "20:00";
        break;
      default:
        // Custom/Other: mid-morning
        setting.reminderTime = "09:00";
    }

    await saveGoalNotificationSetting(setting);
  }
}
