import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ANIMATIONS_LEVEL_KEY = "animations_level";

export type AnimationLevel = "full" | "reduced" | "off";

interface AnimationsState {
  animationLevel: AnimationLevel;
  setAnimationLevel: (level: AnimationLevel) => void;
  initializeAnimations: () => Promise<void>;
}

export const useAnimationsStore = create<AnimationsState>((set, get) => ({
  animationLevel: "full",

  initializeAnimations: async () => {
    try {
      const animationLevel = await AsyncStorage.getItem(ANIMATIONS_LEVEL_KEY);

      set({
        animationLevel: (animationLevel as AnimationLevel) || "full",
      });
    } catch (error) {
      if (__DEV__) console.error("Failed to load animation settings:", error);
      set({
        animationLevel: "full",
      });
    }
  },

  setAnimationLevel: (level: AnimationLevel) => {
    set({ animationLevel: level });
    AsyncStorage.setItem(ANIMATIONS_LEVEL_KEY, level);
  },
}));

export const useAnimations = () => {
  const { animationLevel, setAnimationLevel } = useAnimationsStore();

  return {
    animationLevel,
    setAnimationLevel,
  };
};
