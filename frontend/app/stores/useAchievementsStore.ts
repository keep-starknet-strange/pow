import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import achievementsJson from "../configs/achievements.json";
import inAppNotificationsJson from "../configs/inAppNotifications.json";
import { useInAppNotificationsStore } from "./useInAppNotificationsStore";

interface AchievementState {
  achievementsProgress: { [key: number]: number };
  updateAchievement: (achievementId: number, progress: number) => void;
  initializeAchievements: () => Promise<void>;
  playSoundEffect?: (sound: string) => void;
  setSoundDependency: (playSoundEffect: (sound: string) => void) => void;
}

export const useAchievementsStore = create<AchievementState>((set, get) => ({
  achievementsProgress: {},

  setSoundDependency: (playSoundEffect) => {
    set({ playSoundEffect });
  },

  initializeAchievements: async () => {
    const initialAchievementsProgress: { [key: number]: number } = {};

    achievementsJson.forEach((achievement: any) => {
      initialAchievementsProgress[achievement.id] = 0;
    });

    for (const achievement of achievementsJson) {
      try {
        const value = await AsyncStorage.getItem(
          `achievement_${achievement.id}`,
        );
        if (value !== null) {
          initialAchievementsProgress[achievement.id] = parseInt(value, 10);
        }
      } catch (error) {
        console.error("Error fetching achievement progress:", error);
      }
    }

    set({ achievementsProgress: initialAchievementsProgress });
  },

  updateAchievement: (achievementId: number, progress: number) => {
    const { playSoundEffect } = get();
    const clampedProgress = Math.min(progress, 100);

    set((state) => ({
      achievementsProgress: {
        ...state.achievementsProgress,
        [achievementId]: clampedProgress,
      },
    }));

    if (clampedProgress >= 100) {
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

    AsyncStorage.setItem(
      `achievement_${achievementId}`,
      clampedProgress.toString(),
    ).catch((error) =>
      console.error("Error saving achievement progress:", error),
    );
  },
}));

export const useAchievement = () => {
  const { updateAchievement, achievementsProgress } = useAchievementsStore();
  return { updateAchievement, achievementsProgress };
};
