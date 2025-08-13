import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tutorialConfig from "../configs/tutorial.json";

const TUTORIAL_ACTIVE_KEY = "tutorial_active";
const TUTORIAL_STEP_KEY = "tutorial_step";
const TUTORIAL_STEP_INDEX_KEY = "tutorial_step_index";

export type TutorialStep = keyof typeof tutorialConfig;
export type TargetId =
  | keyof (typeof tutorialConfig)[TutorialStep]["bubbleTargetId"]
  | keyof (typeof tutorialConfig)[TutorialStep]["highlightTargetId"];

interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialState {
  isTutorialActive: boolean;
  step: TutorialStep;
  stepIndex: number;
  layouts: Partial<Record<TargetId, Layout>>;
  visible: boolean;

  advanceStep: () => void;
  registerLayout: (targetId: TargetId, layout: Layout) => void;
  setVisible: (visible: boolean) => void;
  setIsTutorialActive: (active: boolean) => void;
  resetTutorial: () => void;
  initializeTutorial: () => Promise<void>;
  saveTutorialProgress: () => Promise<void>;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isTutorialActive: true,
  step: "mineBlock",
  stepIndex: 0,
  layouts: {},
  visible: false,

  initializeTutorial: async () => {
    try {
      const [tutorialActive, tutorialStep, tutorialStepIndex] =
        await Promise.all([
          AsyncStorage.getItem(TUTORIAL_ACTIVE_KEY),
          AsyncStorage.getItem(TUTORIAL_STEP_KEY),
          AsyncStorage.getItem(TUTORIAL_STEP_INDEX_KEY),
        ]);

      const keys = Object.keys(tutorialConfig) as TutorialStep[];

      // Parse saved values
      const isActive =
        tutorialActive === null ? true : tutorialActive === "true";
      const savedStep = tutorialStep as TutorialStep | null;
      const savedIndex = tutorialStepIndex
        ? parseInt(tutorialStepIndex, 10)
        : 0;

      // Validate saved step exists in config
      const validStep =
        savedStep && keys.includes(savedStep) ? savedStep : "mineBlock";
      const validIndex = savedStep && keys.includes(savedStep) ? savedIndex : 0;

      set({
        isTutorialActive: isActive,
        step: validStep,
        stepIndex: validIndex,
        visible: isActive,
      });
    } catch (error) {
      console.error("Failed to load tutorial progress:", error);
    }
  },

  saveTutorialProgress: async () => {
    const state = get();
    try {
      await Promise.all([
        AsyncStorage.setItem(
          TUTORIAL_ACTIVE_KEY,
          state.isTutorialActive.toString(),
        ),
        AsyncStorage.setItem(TUTORIAL_STEP_KEY, state.step),
        AsyncStorage.setItem(
          TUTORIAL_STEP_INDEX_KEY,
          state.stepIndex.toString(),
        ),
      ]);
    } catch (error) {
      console.error("Failed to save tutorial progress:", error);
    }
  },

  advanceStep: () => {
    set((state) => {
      const keys = Object.keys(tutorialConfig) as TutorialStep[];
      const next = Math.min(state.stepIndex + 1, keys.length - 1);

      // Check if tutorial is completed
      const isCompleted =
        next >= keys.length - 1 && state.stepIndex === keys.length - 1;

      return {
        stepIndex: next,
        step: keys[next],
        isTutorialActive: !isCompleted, // Deactivate tutorial when completed
      };
    });

    // Save progress after advancing
    get().saveTutorialProgress();
  },

  registerLayout: (targetId: TargetId, layout: Layout) => {
    set((state) => {
      const old = state.layouts[targetId];

      if (
        old &&
        old.x === layout.x &&
        old.y === layout.y &&
        old.width === layout.width &&
        old.height === layout.height
      ) {
        return state;
      }

      return {
        layouts: { ...state.layouts, [targetId]: layout },
      };
    });
  },

  setVisible: (visible: boolean) => set({ visible }),

  setIsTutorialActive: (active: boolean) => {
    set({ isTutorialActive: active });
    // Save the active state
    AsyncStorage.setItem(TUTORIAL_ACTIVE_KEY, active.toString());
  },

  resetTutorial: () => {
    set({
      isTutorialActive: true,
      step: "mineBlock",
      stepIndex: 0,
      layouts: {},
      visible: false,
    });

    // Clear saved progress
    Promise.all([
      AsyncStorage.removeItem(TUTORIAL_ACTIVE_KEY),
      AsyncStorage.removeItem(TUTORIAL_STEP_KEY),
      AsyncStorage.removeItem(TUTORIAL_STEP_INDEX_KEY),
    ]).catch((error) => {
      console.error("Failed to clear tutorial progress:", error);
    });
  },
}));

export const useTutorial = () => {
  const {
    isTutorialActive,
    step,
    advanceStep,
    registerLayout,
    layouts,
    visible,
    setVisible,
    resetTutorial,
  } = useTutorialStore();

  return {
    isTutorialActive,
    step,
    advanceStep,
    registerLayout,
    layouts,
    visible,
    setVisible,
    resetTutorial,
  };
};
