import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOUND_KEY = "soundSetting";
const MUSIC_KEY = "musicSetting";

type SoundContextType = {
  isSoundOn: boolean;
  isMusicOn: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
};

// Create Context
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Hook to use sound context
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
};

// Sound Provider Component
export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isMusicOn, setIsMusicOn] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSound = await AsyncStorage.getItem(SOUND_KEY);
        const savedMusic = await AsyncStorage.getItem(MUSIC_KEY);

        if (savedSound !== null) setIsSoundOn(savedSound === "true");
        if (savedMusic !== null) setIsMusicOn(savedMusic === "true");
      } catch (error) {
        console.error("Failed to load sound settings:", error);
      }
    };

    loadSettings();
  }, []);

  const toggleSound = () => {
    setIsSoundOn((prev) => {
      const newValue = !prev;
      AsyncStorage.setItem(SOUND_KEY, newValue.toString());
      return newValue;
    });;
  };

  const toggleMusic = async () => {
    setIsMusicOn((prev) => {
      const newValue = !prev;
      AsyncStorage.setItem(MUSIC_KEY, newValue.toString()); // Save to AsyncStorage
      return newValue;
    });
  };

  return (
    <SoundContext.Provider value={{ isSoundOn, isMusicOn, toggleSound, toggleMusic }}>
      {children}
    </SoundContext.Provider>
  );
};
