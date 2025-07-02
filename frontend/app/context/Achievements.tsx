import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocEngine } from "../context/FocEngineConnector";
import { useInAppNotifications } from "../context/InAppNotifications";
import { useSound } from "../context/Sound";
import achievementsJson from "../configs/achievements.json";
import inAppNotificationsJson from "../configs/inAppNotifications.json";

type AchievementContextType = {
  updateAchievement: (achievementId: number, progress: number) => void;
  achievementsProgress: { [key: number]: number };
};

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined,
);

export const useAchievement = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error(
      "useAchievement must be used within an AchievementProvider",
    );
  }
  return context;
};

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { sendInAppNotification } = useInAppNotifications();
  const { playSoundEffect } = useSound();
  const { user } = useFocEngine();
  const [achievementsProgress, setAchievementsProgress] = useState<{
    [key: number]: number;
  }>({});
  useEffect(() => {
    const initialAchievementsProgress: { [key: number]: number } = {};
    achievementsJson.forEach((achievement: any) => {
      initialAchievementsProgress[achievement.id] = 0; // Initialize progress to 0
    });
    // Load saved progress from local storage
    achievementsJson.forEach((achievement: any) => {
      AsyncStorage.getItem(`${user?.account_address}.achievement_${achievement.id}`)
        .then((value) => {
          if (value !== null) {
            initialAchievementsProgress[achievement.id] = parseInt(value, 10);
          }
        })
        .catch((error) =>
          console.error("Error fetching achievement progress:", error),
        );
    });
    setAchievementsProgress(initialAchievementsProgress);
  }, [user]);

  const updateAchievement = useCallback(
    (achievementId: number, progress: number) => {
      setAchievementsProgress((prevAchievements) => ({
        ...prevAchievements,
        [achievementId]: Math.min(progress, 100), // Ensure progress does not exceed 100
      }));
      if (progress >= 100) {
        playSoundEffect("AchievementCompleted");
        const typeId =
          inAppNotificationsJson.find(
            (notification) => notification.eventType === "AchievementCompleted",
          )?.id || 0;
        const achievement = achievementsJson.find(
          (ach) => ach.id === achievementId,
        );
        const message = "Achieved! " + (achievement?.name || "Unknown");
        sendInAppNotification(typeId, message);
      }
      AsyncStorage.setItem(
        `${user?.account_address}.achievement_${achievementId}`,
        progress.toString(),
      ).catch((error) =>
        console.error("Error saving achievement progress:", error),
      );
    },
    [playSoundEffect, user, sendInAppNotification],
  );

  return (
    <AchievementContext.Provider
      value={{ updateAchievement, achievementsProgress }}
    >
      {children}
    </AchievementContext.Provider>
  );
};
