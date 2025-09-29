import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import achievementsJson from "../configs/achievements.json";
import inAppNotificationsJson from "../configs/inAppNotifications.json";
import { useInAppNotificationsStore } from "./useInAppNotificationsStore";

interface AchievementState {
  achievementsAccount: string;
  achievementsProgress: { [key: number]: number };
  achievementsUnlockedAt: { [key: number]: number };
  lastViewedAt: number;
  isInitialized: boolean;
  updateAchievement: (achievementId: number, progress: number) => void;
  initializeAchievements: (account?: string) => Promise<void>;
  playSoundEffect?: (sound: string) => void;
  setSoundDependency: (playSoundEffect: (sound: string) => void) => void;
  setAchievementsLastViewedNow: () => void;
  resetAchievementsOnPrestige: () => Promise<void>;
  resetAchievementsState: (account?: string) => Promise<void>;
}

export const useAchievementsStore = create<AchievementState>((set, get) => ({
  achievementsAccount: "default",
  achievementsProgress: {},
  achievementsUnlockedAt: {},
  lastViewedAt: 0,
  isInitialized: false,

  setSoundDependency: (playSoundEffect) => {
    set({ playSoundEffect });
  },

  initializeAchievements: async (account: string = "default") => {
    const initialAchievementsProgress: { [key: number]: number } = {};
    const initialAchievementsUnlockedAt: { [key: number]: number } = {};

    achievementsJson.forEach((achievement: any) => {
      initialAchievementsProgress[achievement.id] = 0;
      initialAchievementsUnlockedAt[achievement.id] = 0;
    });

    for (const achievement of achievementsJson) {
      try {
        const [progressStr, unlockedAtStr] = await Promise.all([
          AsyncStorage.getItem(`${account}.achievement_${achievement.id}`),
          AsyncStorage.getItem(
            `${account}.achievement_${achievement.id}_unlockedAt`,
          ),
        ]);

        if (progressStr !== null) {
          initialAchievementsProgress[achievement.id] = parseInt(
            progressStr,
            10,
          );
        }
        if (unlockedAtStr !== null) {
          initialAchievementsUnlockedAt[achievement.id] = parseInt(
            unlockedAtStr,
            10,
          );
        }

        // Migration: if progress already 100 but unlockedAt missing, set now
        if (
          initialAchievementsProgress[achievement.id] >= 100 &&
          !initialAchievementsUnlockedAt[achievement.id]
        ) {
          const now = Date.now();
          initialAchievementsUnlockedAt[achievement.id] = now;
          AsyncStorage.setItem(
            `${account}.achievement_${achievement.id}_unlockedAt`,
            String(now),
          ).catch(() => {});
        }
      } catch (error) {
        console.error("Error fetching achievement data:", error);
      }
    }

    let lastViewedAt = 0;
    try {
      const lastViewedStr = await AsyncStorage.getItem(
        `${account}.achievements_lastViewedAt`,
      );
      if (lastViewedStr !== null) {
        lastViewedAt = parseInt(lastViewedStr, 10) || 0;
      }
    } catch (error) {
      console.error("Error fetching achievements lastViewedAt:", error);
    }

    set({ achievementsAccount: account });
    set({ achievementsProgress: initialAchievementsProgress });
    set({ achievementsUnlockedAt: initialAchievementsUnlockedAt });
    set({ lastViewedAt });
    set({
      achievementsProgress: initialAchievementsProgress,
      isInitialized: true,
    });
  },

  updateAchievement: (achievementId: number, progress: number) => {
    const { playSoundEffect } = get();
    const clampedProgress = Math.min(progress, 100);

    const prevProgress = get().achievementsProgress[achievementId] || 0;

    // Don't allow progress to decrease if achievement is already completed
    if (prevProgress >= 100 && clampedProgress < 100) {
      return;
    }

    const didUnlockNow = prevProgress < 100 && clampedProgress >= 100;
    const isAlreadyUnlocked = get().achievementsUnlockedAt[achievementId] > 0;

    set((state) => ({
      achievementsProgress: {
        ...state.achievementsProgress,
        [achievementId]: clampedProgress,
      },
      achievementsUnlockedAt:
        didUnlockNow || (clampedProgress >= 100 && !isAlreadyUnlocked)
          ? {
              ...state.achievementsUnlockedAt,
              [achievementId]: Date.now(),
            }
          : state.achievementsUnlockedAt,
    }));

    if (clampedProgress >= 100 && (!isAlreadyUnlocked || didUnlockNow)) {
      if (playSoundEffect) {
        playSoundEffect("AchievementCompleted");
      }

      const typeId =
        inAppNotificationsJson.find(
          (notification) => notification.eventType === "AchievementCompleted",
        )?.id || 0;
      const achievement = achievementsJson.find(
        (ach) => ach.id === achievementId,
      );
      const message = "Achieved! " + (achievement?.name || "Unknown");
      useInAppNotificationsStore
        .getState()
        .sendInAppNotification(typeId, message);
    }

    const account = get().achievementsAccount;
    AsyncStorage.setItem(
      `${account}.achievement_${achievementId}`,
      String(clampedProgress),
    ).catch((error) =>
      console.error("Error saving achievement progress:", error),
    );

    if (didUnlockNow || (clampedProgress >= 100 && !isAlreadyUnlocked)) {
      AsyncStorage.setItem(
        `${account}.achievement_${achievementId}_unlockedAt`,
        String(Date.now()),
      ).catch(() => {});
    }
  },

  setAchievementsLastViewedNow: () => {
    const account = get().achievementsAccount;
    const now = Date.now();
    set({ lastViewedAt: now });
    AsyncStorage.setItem(
      `${account}.achievements_lastViewedAt`,
      String(now),
    ).catch((error) =>
      console.error("Error saving achievements lastViewedAt:", error),
    );
  },

  resetAchievementsOnPrestige: async () => {
    const targetAccount = get().achievementsAccount;
    const currentProgress = get().achievementsProgress;
    const currentUnlocked = get().achievementsUnlockedAt;

    const preservedAchievements = [24, 25, 29]; // Prestige!, Reach Max Prestige, STRK Reward Claimed

    const keysToRemove: string[] = [];
    const newProgress: { [key: number]: number } = {};
    const newUnlocked: { [key: number]: number } = {};

    for (const achievement of achievementsJson) {
      if (preservedAchievements.includes(achievement.id)) {
        newProgress[achievement.id] = currentProgress[achievement.id] || 0;
        newUnlocked[achievement.id] = currentUnlocked[achievement.id] || 0;
      } else {
        newProgress[achievement.id] = 0;
        newUnlocked[achievement.id] = 0;
        keysToRemove.push(
          `${targetAccount}.achievement_${achievement.id}`,
          `${targetAccount}.achievement_${achievement.id}_unlockedAt`,
        );
      }
    }

    try {
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error("Error resetting achievements on prestige:", error);
    }

    set({ achievementsProgress: newProgress });
    set({ achievementsUnlockedAt: newUnlocked });
  },

  resetAchievementsState: async (account?: string) => {
    const targetAccount = account || get().achievementsAccount;

    const keysToRemove: string[] = [];
    for (const achievement of achievementsJson) {
      keysToRemove.push(
        `${targetAccount}.achievement_${achievement.id}`,
        `${targetAccount}.achievement_${achievement.id}_unlockedAt`,
      );
    }
    keysToRemove.push(`${targetAccount}.achievements_lastViewedAt`);

    try {
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error("Error resetting achievements state:", error);
    }

    // Reinitialize local state
    const emptyProgress: { [key: number]: number } = {};
    const emptyUnlocked: { [key: number]: number } = {};
    achievementsJson.forEach((achievement: any) => {
      emptyProgress[achievement.id] = 0;
      emptyUnlocked[achievement.id] = 0;
    });
    set({ achievementsProgress: emptyProgress });
    set({ achievementsUnlockedAt: emptyUnlocked });
    set({ lastViewedAt: 0 });
  },
}));

export const useAchievement = () => {
  const { updateAchievement, achievementsProgress } = useAchievementsStore();
  return { updateAchievement, achievementsProgress };
};

export const useAchievementsLastViewed = () => {
  const { setAchievementsLastViewedNow, lastViewedAt } = useAchievementsStore();
  return { setAchievementsLastViewedNow, lastViewedAt };
};

export const useAchievementsUnseenCount = (): number => {
  return useAchievementsStore((state) => {
    const lastViewed = state.lastViewedAt;
    let count = 0;
    for (const idStr in state.achievementsUnlockedAt) {
      const ts = state.achievementsUnlockedAt[idStr as unknown as number] || 0;
      if (ts > lastViewed) count += 1;
    }
    return count;
  }) as number;
};

export const useAchievementsHasUnseen = (): boolean => {
  return useAchievementsStore((state) => {
    const lastViewed = state.lastViewedAt;
    for (const idStr in state.achievementsUnlockedAt) {
      const ts = state.achievementsUnlockedAt[idStr as unknown as number] || 0;
      if (ts > lastViewed) return true;
    }
    return false;
  }) as boolean;
};
