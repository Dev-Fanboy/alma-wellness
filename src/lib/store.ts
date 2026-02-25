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

  // Membership
  membershipStatus: "active" | "expired";
  setMembershipStatus: (status: "active" | "expired") => void;

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
  pendingInviteCode: string | null; // Deep link invite waiting to be processed

  // Actions
  setUserName: (name: string) => void;
  setUserAvatar: (avatar: string) => void;
  setUserAgeRange: (ageRange: string) => void;
  setUserWellnessFocus: (focus: string) => void;
  setInviteCode: (code: string) => void;
  setPendingInviteCode: (code: string | null) => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Omit<Goal, "id" | "current">) => void;
  updateGoal: (id: string, updates: Partial<Omit<Goal, "id">>) => void;
  removeGoal: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  completeGoal: (id: string) => void;
  // Cloud sync setters
  setPlantLevel: (level: number) => void;
  setPlantPoints: (points: number) => void;
  setCurrentStreak: (streak: number) => void;
  setLongestStreak: (streak: number) => void;

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
    name: "Meditation",
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

const MOCK_FRIENDS: Friend[] = [];

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
      userAvatar: "",
      userAgeRange: "",
      userWellnessFocus: "",
      plantLevel: 1,
      plantPoints: 0,
      plantStage: "seed",

      membershipStatus: "expired",
      setMembershipStatus: (status) => set({ membershipStatus: status }),

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
      pendingInviteCode: null, // For deep link invites
      sunStones: 3, // Start with 3 sun stones

      setUserName: (name) => set({ userName: name }),
      setUserAvatar: (avatar) => set({ userAvatar: avatar }),
      setUserAgeRange: (ageRange) => set({ userAgeRange: ageRange }),
      setUserWellnessFocus: (focus) => set({ userWellnessFocus: focus }),
      setInviteCode: (code) => set({ inviteCode: code }),
      setPendingInviteCode: (code) => set({ pendingInviteCode: code }),

      // Cloud sync setters
      setPlantLevel: (level) => set({ plantLevel: level, plantStage: getPlantStage(level) }),
      setPlantPoints: (points) => set({ plantPoints: points }),
      setCurrentStreak: (streak) => set({ currentStreak: streak }),
      setLongestStreak: (streak) => set({ longestStreak: streak }),

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

      updateGoalProgress: (id, progress) => {
        const state = get();
        const goal = state.goals.find((g) => g.id === id);
        if (!goal) return;

        // processing update
        const newCurrent = Math.min(progress, goal.target);

        // If target reached, trigger complete logic directly
        // completeGoal will handle setting current to target and updating streak
        if (newCurrent >= goal.target) {
          get().completeGoal(id);
          return;
        }

        // Update the goal with new progress
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, current: newCurrent } : g
          ),
        }));
      },

      completeGoal: (id) => {
        const state = get();
        const goal = state.goals.find((g) => g.id === id);

        // We allow completion if not yet fully met OR if we just want to trigger checking (idempotent)
        // But mainly we want to avoid double-processing points unless we handle that carefully.
        // Actually, existing logic: if (goal && goal.current < goal.target)
        // We should relax this check effectively because we might call completeGoal FROM updateGoalProgress
        // where we ALREADY set current=target (via the local optimistic update in updateGoalProgress? No, we removed that).
        // Wait, in my previous fix I REMOVED the local update in updateGoalProgress if target met.
        // So goal.current IS < goal.target coming in. Safe.

        if (goal && goal.current < goal.target) {
          const newPoints = state.plantPoints + goal.points;
          const pointsPerLevel = 100;
          const newLevel = Math.floor(newPoints / pointsPerLevel) + 1;
          const today = getTodayDate();

          // Calculate total completed goals (including this one)
          // We assume this goal is about to be completed
          const otherCompletedCount = state.goals.filter(g => g.id !== id && g.current >= g.target).length;
          const totalCompleted = otherCompletedCount + 1;

          // Update streak ONLY if we have at least 2 goals completed
          let newStreak = state.currentStreak;
          let newLongestStreak = state.longestStreak;
          let newLastActiveDate = state.lastActiveDate;

          const STREAK_THRESHOLD = 2;

          if (totalCompleted >= STREAK_THRESHOLD) {
            if (state.lastActiveDate !== today) {
              if (
                isConsecutiveDay(state.lastActiveDate, today) ||
                state.lastActiveDate === ""
              ) {
                newStreak = state.currentStreak + 1;
              } else if (!isSameDay(state.lastActiveDate, today)) {
                // Streak broken if more than 1 day gap
                // Note: checkAndResetDaily usually handles breaking, but if we resume after long break:
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
              newLastActiveDate = today;
            }
          }

          // Update achievement progress based on goal type
          const updatedAchievements = state.achievements.map((ach) => {
            let newProgress = ach.progress;
            if (goal.type === "hydration" && ach.id === "hydration_hero") {
              newProgress = ach.progress + 1;
            }
            if (goal.type === "meditation" && ach.id === "mindful_master") {
              newProgress = ach.progress + 1;
            }
            if (goal.type === "walking" && ach.id === "step_champion") {
              newProgress = ach.progress + 1;
            }
            if (ach.id === "first_bloom") {
              newProgress = newLevel;
            }
            if (ach.id === "week_warrior") {
              newProgress = newStreak;
            }
            if (newProgress !== ach.progress) {
              return {
                ...ach,
                progress: newProgress,
                unlockedAt:
                  newProgress >= ach.requirement && !ach.unlockedAt
                    ? new Date().toISOString()
                    : ach.unlockedAt,
              };
            }
            return ach;
          });

          // Update today's entry in dailyHistory so cloud sync gets accurate data
          const updatedGoals = state.goals.map((g) =>
            g.id === id ? { ...g, current: g.target } : g
          );
          const completedCount = updatedGoals.filter(g => g.current >= g.target).length;
          const todayPoints = updatedGoals
            .filter(g => g.current >= g.target)
            .reduce((sum, g) => sum + g.points, 0);

          const existingTodayIdx = state.dailyHistory.findIndex(d => d.date === today);
          const todayEntry: DailyProgress = {
            date: today,
            goalsCompleted: completedCount,
            totalGoals: updatedGoals.length,
            pointsEarned: todayPoints,
            goalDetails: updatedGoals.map(g => ({
              goalId: g.id,
              completed: g.current >= g.target,
            })),
          };

          const updatedHistory = existingTodayIdx >= 0
            ? state.dailyHistory.map((d, i) => i === existingTodayIdx ? todayEntry : d)
            : [...state.dailyHistory, todayEntry].slice(-30);

          set({
            goals: updatedGoals,
            plantPoints: newPoints,
            plantLevel: newLevel,
            plantStage: getPlantStage(newLevel),
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActiveDate: newLastActiveDate,
            achievements: updatedAchievements,
            dailyHistory: updatedHistory,
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

      resetOnboarding: () =>
        set({ hasCompletedOnboarding: false, hasSeenTour: false }),

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
          userAvatar: "",
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
          membershipStatus: "expired",
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
        inviteCode: state.inviteCode,
        membershipStatus: state.membershipStatus,
      }),
    }
  )
);
