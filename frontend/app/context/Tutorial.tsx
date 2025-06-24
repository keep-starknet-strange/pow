import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useEventManager } from "../context/EventManager";
import { TutorialObserver } from "../observers/TutorialObserver";
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

interface TutorialContextType {
  isTutorialActive: boolean;
  step: TutorialStep;
  advanceStep: () => void;
  registerLayout: (targetId: TargetId, layout: Layout) => void;
  layouts?: Partial<Record<TargetId, Layout>>;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}
const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // TODO: add setTutorialActive to the tutorial observer and settings
  const [isTutorialActive, setIsTutorialActive] = useState(true);
  const [step, setStep] = useState<TutorialStep>("mineBlock");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [layouts, setLayouts] = useState<Partial<Record<TargetId, Layout>>>();
  const [visible, setVisible] = useState(false);
  const { registerObserver, unregisterObserver } = useEventManager();
  const advanceStep = useCallback(() => {
    setStepIndex((prev) => {
      const keys = Object.keys(tutorialConfig) as TutorialStep[];
      const next = Math.min(prev + 1, keys.length - 1);
      setStep(keys[next]);
      return next;
    });
  }, []);

  const registerLayout = useCallback((targetId: TargetId, layout: Layout) => {
    setLayouts((prev) => {
      const old = prev?.[targetId];
      if (
        old &&
        old.x === layout.x &&
        old.y === layout.y &&
        old.width === layout.width &&
        old.height === layout.height
      ) {
        return prev;
      }
      return { ...prev, [targetId]: layout };
    });
  }, []);

  useEffect(() => {
    const observer = new TutorialObserver(advanceStep, setVisible, step);
    const id = registerObserver(observer);
    return () => {
      unregisterObserver(id);
    };
  }, [step]);

  return (
    <TutorialContext.Provider
      value={{
        step,
        advanceStep,
        registerLayout,
        layouts,
        visible,
        setVisible,
        isTutorialActive,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = (): TutorialContextType => {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return ctx;
};
