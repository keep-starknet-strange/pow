import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useEventManager } from "../context/EventManager";
import { TutorialObserver } from "../observers/TutorialObserver";

type TutorialStep = "mineBlock" | "transactions" | "completed";
interface Layout { x: number; y: number; width: number; height: number; }
interface TutorialContextType {
  step: TutorialStep;
  advanceStep: () => void;
  registerLayout: (stepKey: TutorialStep, layout: Layout) => void;
  layouts?: Partial<Record<TutorialStep, Layout>>;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}
const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<TutorialStep>("mineBlock");
  const [layouts, setLayouts] = useState<Partial<Record<TutorialStep, Layout>>>();
  const [visible, setVisible] = useState(false);
  const { registerObserver, unregisterObserver } = useEventManager();
  const advanceStep = useCallback(() => {
    setStep(prev => (prev === "mineBlock" ? "transactions" : "completed"));
  }, []);

  const registerLayout = useCallback(
    (stepKey: TutorialStep, layout: Layout) => {
    setLayouts(prev => {
      const old = prev?.[stepKey];
      if (
        old &&
        old.x === layout.x &&
        old.y === layout.y &&
        old.width === layout.width &&
        old.height === layout.height
      ) {
        return prev;
      }
      return { ...prev, [stepKey]: layout };
    });
  }, []);


  useEffect(() => {
    const observer = new TutorialObserver(advanceStep, setVisible);
    const id = registerObserver(observer);
    return () => {
      unregisterObserver(id);
    };
  }, []);
    
  return (
    <TutorialContext.Provider value={{ step, advanceStep, registerLayout, layouts, visible, setVisible }}>
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
