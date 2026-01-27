import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type GoalType =
  | "walking"
  | "hydration"
  | "meditation"
  | "journaling"
  | "custom";

export interface Goal {
  id: string;
  type: GoalType;
  name: string;
  icon: string;
  target: number;
  unit: string;
  current: number;
  points: number;
  color: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  plantLevel: number;
  totalPoints: number;
  isOnline: boolean;
  weeklyPoints?: number;
  currentStreak?: number;
  joinedAt?: string;
  lastActive?: number; // hours since last activity
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: "steps" | "hydration" | "meditation" | "any";
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: { userId: string; progress: number }[];
  reward: number;
}

export interface DailyProgress {
  date: string;
  goalsCompleted: number;
  totalGoals: number;
  pointsEarned: number;
  goalDetails: { goalId: string; completed: boolean }[];
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: "great" | "good" | "okay" | "low";
  prompt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  unlockedAt?: string;
}

interface WellnessState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  hasSeenTour: boolean;
  setHasSeenTour: (value: boolean) => void;

  // User info
  userName: string;
  userAvatar: string;
  userAgeRange: string;
  userWellnessFocus: string;

  // Plant growth
  plantLevel: number;
  plantPoints: number;
  plantStage: "seed" | "sprout" | "growing" | "budding" | "blooming";

  // Goals
  goals: Goal[];
  lastResetDate: string;
  dailyHistory: DailyProgress[];

  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;

  // Journal
  journalEntries: JournalEntry[];

  // Achievements
  achievements: Achievement[];

  // Friends & Garden
  friends: Friend[];
  friendRequests: FriendRequest[];
  communityChallenges: CommunityChallenge[];
  inviteCode: string;

  // Actions
  setUserName: (name: string) => void;
  setUserAvatar: (avatar: string) => void;
  setUserAgeRange: (ageRange: string) => void;
  setUserWellnessFocus: (focus: string) => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Omit<Goal, "id" | "current">) => void;
  updateGoal: (id: string, updates: Partial<Omit<Goal, "id">>) => void;
  removeGoal: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  completeGoal: (id: string) => void;
  checkAndResetDaily: () => {
    newDay: boolean;
    streakBroken: boolean;
    rescued: boolean;
  };
  addPoints: (points: number) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  resetOnboarding: () => void;

  // Friend actions
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  addFriendRequest: (request: FriendRequest) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  generateInviteCode: () => string;

  // Inventory
  sunStones: number;
  consumeSunStone: () => void;
  addSunStone: (amount?: number) => void;

  // Reset
  resetAllData: () => void;
}

const DEFAULT_GOALS: Goal[] = [
  {
    id: "1",
    type: "walking",
    name: "Daily Steps",
    icon: "Footprints",
    target: 10000,
    unit: "steps",
    current: 0,
    points: 20,
    color: "#94a67e",
  },
  {
    id: "2",
    type: "hydration",
    name: "Water Intake",
    icon: "Droplets",
    target: 8,
    unit: "glasses",
    current: 0,
    points: 15,
    color: "#7fb3d3",
  },
  {
    id: "3",
    type: "meditation",
    name: "Mindfulness",
    icon: "Brain",
    target: 10,
    unit: "minutes",
    current: 0,
    points: 25,
    color: "#c4a7e7",
  },
  {
    id: "4",
    type: "journaling",
    name: "Gratitude",
    icon: "BookHeart",
    target: 1,
    unit: "entry",
    current: 0,
    points: 30,
    color: "#e7a7b8",
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_bloom",
    title: "First Bloom",
    description: "Reach level 15",
    icon: "Flower2",
    requirement: 15,
    progress: 0,
  },
  {
    id: "hydration_hero",
    title: "Hydration Hero",
    description: "Complete water goal 7 days",
    icon: "Droplets",
    requirement: 7,
    progress: 0,
  },
  {
    id: "mindful_master",
    title: "Mindful Master",
    description: "30 meditation sessions",
    icon: "Brain",
    requirement: 30,
    progress: 0,
  },
  {
    id: "step_champion",
    title: "Step Champion",
    description: "Complete step goal 10 times",
    icon: "Footprints",
    requirement: 10,
    progress: 0,
  },
  {
    id: "week_warrior",
    title: "Week Warrior",
    description: "7 day streak",
    icon: "Flame",
    requirement: 7,
    progress: 0,
  },
  {
    id: "journaling_journey",
    title: "Journaling Journey",
    description: "Write 14 journal entries",
    icon: "BookHeart",
    requirement: 14,
    progress: 0,
  },
];

const MOCK_FRIENDS: Friend[] = [
  {
    id: "1",
    name: "Sarah",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    plantLevel: 12,
    totalPoints: 1450,
    isOnline: true,
    weeklyPoints: 280,
    currentStreak: 5,
    joinedAt: "2025-11-15T00:00:00.000Z",
    lastActive: 2, // active 2 hours ago
  },
  {
    id: "2",
    name: "Emma",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    plantLevel: 8,
    totalPoints: 980,
    isOnline: false,
    weeklyPoints: 195,
    currentStreak: 3,
    joinedAt: "2025-12-01T00:00:00.000Z",
    lastActive: 72, // wilting - inactive for 3 days
  },
  {
    id: "3",
    name: "Maya",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    plantLevel: 15,
    totalPoints: 1820,
    isOnline: false,
    weeklyPoints: 350,
    currentStreak: 12,
    joinedAt: "2025-10-20T00:00:00.000Z",
    lastActive: 56, // wilting - inactive for over 2 days
  },
  {
    id: "4",
    name: "Luna",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
    plantLevel: 6,
    totalPoints: 720,
    isOnline: true,
    weeklyPoints: 140,
    currentStreak: 2,
    joinedAt: "2025-12-10T00:00:00.000Z",
    lastActive: 1, // active 1 hour ago
  },
  {
    id: "5",
    name: "Aria",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100",
    plantLevel: 10,
    totalPoints: 1200,
    isOnline: false,
    weeklyPoints: 220,
    currentStreak: 7,
    joinedAt: "2025-11-05T00:00:00.000Z",
    lastActive: 24, // active 1 day ago (not wilting yet)
  },
];

const getPlantStage = (
  level: number
): "seed" | "sprout" | "growing" | "budding" | "blooming" => {
  if (level < 3) return "seed";
  if (level < 6) return "sprout";
  if (level < 10) return "growing";
  if (level < 15) return "budding";
  return "blooming";
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

const isConsecutiveDay = (lastDate: string, currentDate: string): boolean => {
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (value) =>
        set({ hasCompletedOnboarding: value }),
      hasSeenTour: false,
      setHasSeenTour: (value) => set({ hasSeenTour: value }),

      // User
      userName: "",
      userAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
      userAgeRange: "",
      userWellnessFocus: "",
      plantLevel: 1,
      plantPoints: 0,
      plantStage: "seed",
      goals: DEFAULT_GOALS,
      lastResetDate: getTodayDate(),
      dailyHistory: [],

      // Streaks
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",

      // Journal
      journalEntries: [],

      // Achievements
      achievements: DEFAULT_ACHIEVEMENTS,

      // Friends
      friends: MOCK_FRIENDS,
      friendRequests: [] as FriendRequest[],
      communityChallenges: [] as CommunityChallenge[],
      inviteCode: "ALMA" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      sunStones: 3, // Start with 3 sun stones

      setUserName: (name) => set({ userName: name }),
      setUserAvatar: (avatar) => set({ userAvatar: avatar }),
      setUserAgeRange: (ageRange) => set({ userAgeRange: ageRange }),
      setUserWellnessFocus: (focus) => set({ userWellnessFocus: focus }),

      setGoals: (goals) => set({ goals }),

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            { ...goal, id: Date.now().toString(), current: 0 },
          ],
        })),

      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      updateGoalProgress: (id, progress) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, current: Math.min(progress, g.target) } : g
          ),
        })),

      completeGoal: (id) => {
        const state = get();
        const goal = state.goals.find((g) => g.id === id);
        if (goal && goal.current < goal.target) {
          const newPoints = state.plantPoints + goal.points;
          const pointsPerLevel = 100;
          const newLevel = Math.floor(newPoints / pointsPerLevel) + 1;
          const today = getTodayDate();

          // Update streak
          let newStreak = state.currentStreak;
          let newLongestStreak = state.longestStreak;

          if (state.lastActiveDate !== today) {
            if (
              isConsecutiveDay(state.lastActiveDate, today) ||
              state.lastActiveDate === ""
            ) {
              newStreak = state.currentStreak + 1;
            } else if (!isSameDay(state.lastActiveDate, today)) {
              // Streak broken if more than 1 day gap
              const last = new Date(state.lastActiveDate);
              const current = new Date(today);
              const diffDays = Math.floor(
                (current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (diffDays > 1) {
                newStreak = 1;
              }
            }
            newLongestStreak = Math.max(newLongestStreak, newStreak);
          }

          // Update achievement progress based on goal type
          const updatedAchievements = state.achievements.map((ach) => {
            if (goal.type === "hydration" && ach.id === "hydration_hero") {
              return { ...ach, progress: ach.progress + 1 };
            }
            if (goal.type === "meditation" && ach.id === "mindful_master") {
              return { ...ach, progress: ach.progress + 1 };
            }
            if (goal.type === "walking" && ach.id === "step_champion") {
              return { ...ach, progress: ach.progress + 1 };
            }
            if (ach.id === "first_bloom") {
              return { ...ach, progress: newLevel };
            }
            if (ach.id === "week_warrior") {
              return { ...ach, progress: newStreak };
            }
            return ach;
          });

          set({
            goals: state.goals.map((g) =>
              g.id === id ? { ...g, current: g.target } : g
            ),
            plantPoints: newPoints,
            plantLevel: newLevel,
            plantStage: getPlantStage(newLevel),
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActiveDate: today,
            achievements: updatedAchievements,
          });
        }
      },

      checkAndResetDaily: () => {
        const state = get();
        const today = getTodayDate();

        if (state.lastResetDate !== today) {
          // Save yesterday's progress to history
          const completedGoals = state.goals.filter(
            (g) => g.current >= g.target
          );
          const pointsEarned = completedGoals.reduce(
            (acc, g) => acc + g.points,
            0
          );

          const yesterdayProgress: DailyProgress = {
            date: state.lastResetDate,
            goalsCompleted: completedGoals.length,
            totalGoals: state.goals.length,
            pointsEarned,
            goalDetails: state.goals.map((g) => ({
              goalId: g.id,
              completed: g.current >= g.target,
            })),
          };

          // Logic: The Sunrise Protocol
          let newStreak = state.currentStreak;
          let streakBroken = false;
          let rescued = false;
          let sunStones = state.sunStones;

          // If lastActiveDate is missing, treat as day 0
          const lastActive = state.lastActiveDate || state.lastResetDate;

          // Calculate days passed since last REAL activity
          // We use lastActiveDate because simple "logins" don't count if no goals were done
          const daysSinceActive = Math.floor(
            (new Date(today).getTime() - new Date(lastActive).getTime()) /
            (1000 * 60 * 60 * 24)
          );

          // Scenario 1: User active yesterday (1 day gap)
          if (daysSinceActive <= 1) {
            // Routine reset, preserve streak IF goals were met yesterday? 
            // Actually, if daysSinceActive is 1, it means they DID something yesterday (since lastActiveDate is set on completeGoal).
            // So streak is safe.
            // But if they logged in yesterday but did NOTHING, lastActiveDate would be > 1 (from day before).
            // So relying on daysSinceActive handles the "Empty Login" case correctly.
            streakBroken = false;
          }
          // Scenario 2: Missed a day (or more)
          else {
            // Try to rescue with Sun Stone
            if (sunStones > 0) {
              sunStones -= 1;
              rescued = true;
              streakBroken = false;
              // Streak stays same
            } else {
              newStreak = 0;
              streakBroken = true;
            }
          }

          set({
            goals: state.goals.map((g) => ({ ...g, current: 0 })),
            lastResetDate: today,
            dailyHistory: [...state.dailyHistory, yesterdayProgress].slice(-30),
            currentStreak: newStreak,
            sunStones: sunStones,
          });

          return { newDay: true, streakBroken, rescued };
        }
        return { newDay: false, streakBroken: false, rescued: false };
      },

      addPoints: (points) =>
        set((state) => {
          const newPoints = state.plantPoints + points;
          const pointsPerLevel = 100;
          const newLevel = Math.floor(newPoints / pointsPerLevel) + 1;
          return {
            plantPoints: newPoints,
            plantLevel: newLevel,
            plantStage: getPlantStage(newLevel),
          };
        }),

      addJournalEntry: (entry) =>
        set((state) => {
          const newEntry = { ...entry, id: Date.now().toString() };

          // Update journaling achievement
          const updatedAchievements = state.achievements.map((ach) => {
            if (ach.id === "journaling_journey") {
              return { ...ach, progress: ach.progress + 1 };
            }
            return ach;
          });

          return {
            journalEntries: [newEntry, ...state.journalEntries],
            achievements: updatedAchievements,
          };
        }),

      updateAchievementProgress: (achievementId, progress) =>
        set((state) => ({
          achievements: state.achievements.map((ach) =>
            ach.id === achievementId
              ? {
                ...ach,
                progress,
                unlockedAt:
                  progress >= ach.requirement && !ach.unlockedAt
                    ? new Date().toISOString()
                    : ach.unlockedAt,
              }
              : ach
          ),
        })),

      resetOnboarding: () => set({ hasCompletedOnboarding: false }),

      // Friend management
      addFriend: (friend) =>
        set((state) => ({
          friends: [...state.friends, friend],
        })),

      removeFriend: (id) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== id),
        })),

      addFriendRequest: (request) =>
        set((state) => ({
          friendRequests: [...state.friendRequests, request],
        })),

      acceptFriendRequest: (requestId) =>
        set((state) => {
          const request = state.friendRequests.find((r) => r.id === requestId);
          if (!request) return state;

          const newFriend: Friend = {
            id: request.fromId,
            name: request.fromName,
            avatar: request.fromAvatar,
            plantLevel: 1,
            totalPoints: 0,
            isOnline: false,
            weeklyPoints: 0,
            currentStreak: 0,
            joinedAt: new Date().toISOString(),
          };

          return {
            friends: [...state.friends, newFriend],
            friendRequests: state.friendRequests.map((r) =>
              r.id === requestId ? { ...r, status: "accepted" as const } : r
            ),
          };
        }),

      rejectFriendRequest: (requestId) =>
        set((state) => ({
          friendRequests: state.friendRequests.map((r) =>
            r.id === requestId ? { ...r, status: "rejected" as const } : r
          ),
        })),

      generateInviteCode: () => {
        const code = "ALMA" + Math.random().toString(36).substring(2, 8).toUpperCase();
        set({ inviteCode: code });
        return code;
      },

      consumeSunStone: () =>
        set((state) => ({
          sunStones: Math.max(0, state.sunStones - 1),
        })),

      addSunStone: (amount = 1) =>
        set((state) => ({
          sunStones: state.sunStones + amount,
        })),

      resetAllData: () => {
        set({
          hasCompletedOnboarding: false,
          hasSeenTour: false,
          userName: "",
          userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
          plantLevel: 1,
          plantPoints: 0,
          plantStage: "seed",
          goals: [],
          lastResetDate: getTodayDate(),
          dailyHistory: [],
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: "",
          journalEntries: [],
          achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, progress: 0, unlockedAt: undefined })),
          friends: MOCK_FRIENDS,
          friendRequests: [],
          communityChallenges: [],
          inviteCode: "ALMA" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          sunStones: 3, // Start with 3 sun stones
        });
      },
    }),
    {
      name: "alma-wellness-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasSeenTour: state.hasSeenTour,
        userName: state.userName,
        userAvatar: state.userAvatar,
        plantLevel: state.plantLevel,
        plantPoints: state.plantPoints,
        plantStage: state.plantStage,
        goals: state.goals,
        lastResetDate: state.lastResetDate,
        dailyHistory: state.dailyHistory,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        journalEntries: state.journalEntries,
        achievements: state.achievements,
        sunStones: state.sunStones,
      }),
    }
  )
);
