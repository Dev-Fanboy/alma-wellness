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

// Consolidated notification scheduler
export async function rescheduleAllNotifications(): Promise<void> {
  // 1. Cancel all existing goal-specific reminders
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const goalReminders = allNotifications.filter(
    (n) => n.content.data?.type === "goal-specific-reminder"
  );

  for (const reminder of goalReminders) {
    await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
  }

  // 2. Get current settings
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.goalSpecificReminders.length) return;

  // 3. Collect all reminder triggers
  const triggers: { hour: number; minute: number; goals: string[] }[] = [];

  for (const setting of settings.goalSpecificReminders) {
    if (!setting.enabled) continue;

    if (setting.useInterval) {
      // Interval logic
      const [startH, startM] = setting.reminderTime.split(":").map(Number);
      const [endH, endM] = setting.endTime.split(":").map(Number);
      const interval = setting.intervalHours;

      let currentH = startH;
      let currentM = startM;
      const endTotalM = endH * 60 + endM;

      while (currentH * 60 + currentM <= endTotalM) {
        addToTriggers(triggers, currentH, currentM, setting.goalName);
        currentH += interval;
      }
    } else {
      // Daily logic
      const [h, m] = setting.reminderTime.split(":").map(Number);
      addToTriggers(triggers, h, m, setting.goalName);
    }
  }

  // 4. Schedule consolidated notifications
  for (const trigger of triggers) {
    const goalList = trigger.goals.join(", ");
    // E.g. "Time for Walking, Hydration"
    // If too many, truncate? "Walking, Hydration and 2 others"
    let body = `Time for ${goalList}!`;
    if (trigger.goals.length > 2) {
      const firstTwo = trigger.goals.slice(0, 2).join(", ");
      const remaining = trigger.goals.length - 2;
      body = `Time for ${firstTwo} and ${remaining} others!`;
    } else if (trigger.goals.length === 1) {
      body = `${getRandomMotivationalMessage()}`; // Use motivation for single goal
    }

    const title = trigger.goals.length === 1
      ? `${trigger.goals[0]} Reminder`
      : "Wellness Reminder 🌿";

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: { type: "goal-specific-reminder" }, // Generic type for grouped
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: trigger.hour,
        minute: trigger.minute,
      },
    });
  }
}

function addToTriggers(
  triggers: { hour: number; minute: number; goals: string[] }[],
  hour: number,
  minute: number,
  goalName: string
) {
  // Normalize time (handle overflow if any, though interval logic above is simple)
  // Find existing trigger for this time
  const existing = triggers.find((t) => t.hour === hour && t.minute === minute);
  if (existing) {
    if (!existing.goals.includes(goalName)) {
      existing.goals.push(goalName);
    }
  } else {
    triggers.push({ hour, minute, goals: [goalName] });
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
  await rescheduleAllNotifications();
}

export async function removeGoalNotificationSetting(goalId: string): Promise<void> {
  const settings = await getNotificationSettings();
  settings.goalSpecificReminders = settings.goalSpecificReminders.filter(
    (s) => s.goalId !== goalId
  );
  await saveNotificationSettings(settings);
  await rescheduleAllNotifications();
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

export async function scheduleDailySeedNotification(): Promise<void> {
  // Check if already scheduled to avoid duplicates (though ID collision handles this often, distinct type helps)
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const hasDailySeed = notifications.some(
    (n) => n.content.data?.type === "daily-seed"
  );

  if (hasDailySeed) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Today's Daily Seed 🌱",
      body: "Discover your thought for the day. Tap to view.",
      data: { type: "daily-seed", deepLink: "/(tabs)?action=openDailySeed" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
    },
  });
}

export async function initializeNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    return;
  }

  const settings = await getNotificationSettings();

  if (settings.enabled) {
    // Schedule Daily Seed (hardcoded 7am for now as per request)
    await scheduleDailySeedNotification();

    if (settings.dailyReminder) {
      await scheduleDailyReminder(settings.dailyReminderTime);
    }
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
