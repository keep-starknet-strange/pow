import { create } from "zustand";
import tutorialConfig from "../configs/tutorial.json";

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
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isTutorialActive: false,
  step: "mineBlock",
  stepIndex: 0,
  layouts: {},
  visible: false,

  advanceStep: () => {
    set((state) => {
      const keys = Object.keys(tutorialConfig) as TutorialStep[];
      const next = Math.min(state.stepIndex + 1, keys.length - 1);
      return {
        stepIndex: next,
        step: keys[next],
      };
    });
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

  setIsTutorialActive: (active: boolean) => set({ isTutorialActive: active }),
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
  } = useTutorialStore();

  return {
    isTutorialActive,
    step,
    advanceStep,
    registerLayout,
    layouts,
    visible,
    setVisible,
  };
};
