import React, { createContext, useContext, useState, useEffect } from "react";
import achievementsJson from "../configs/achievements.json";
import { Achievement } from "../types/Achievement";

type AchievementContextType = {
  updateAchievement: (achievementId: number, progress: number) => void;
  achievements: { [key: number]: Achievement };
};

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievement = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievement must be used within an AchievementProvider");
  }
  return context;
}

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<{ [key: number]: Achievement }>({});
  useEffect(() => {
    const initialAchievements: { [key: number]: Achievement } = {};
    achievementsJson.forEach((achievement: any) => {
      initialAchievements[achievement.id] = {
        id: achievement.id,
        name: achievement.name,
        image: achievement.image,
        progress: 0, // Start with 0 progress
        status: 'locked' // Default status
      };
    });
    setAchievements(initialAchievements);
    // TODO: Fetch status & progress from server ( or update progress thru game events )
  }, []);

  const updateAchievement = (achievementId: number, progress: number) => {
    setAchievements((prevAchievements) => ({
      ...prevAchievements,
      [achievementId]: {
        ...prevAchievements[achievementId],
        progress,
        status: progress >= 100 ? 'claimable' : 'locked'
      },
    }));
  };

  return (
    <AchievementContext.Provider value={{ updateAchievement, achievements }}>
      {children}
    </AchievementContext.Provider>
  );
};
