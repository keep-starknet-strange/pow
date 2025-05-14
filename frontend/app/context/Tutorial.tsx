import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useEventManager } from "../context/EventManager";
import { TutorialObserver } from "../observers/TutorialObserver";

export type TutorialStep = "mineBlock" | "transactions" | "completed";
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
  registerHighlightLayout: (stepKey: TutorialStep, layout: Layout) => void;
  registerBubbleLayout: (stepKey: TutorialStep, layout: Layout) => void;
  bubbleLayouts?: Partial<Record<TutorialStep, Layout>>;
  highlightLayouts?: Partial<Record<TutorialStep, Layout>>;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}
const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // TODO: add setTutorialActive to the tutorial observer and settings
  const [isTutorialActive, setIsTutorialActive] = useState(true);
  const [step, setStep] = useState<TutorialStep>("mineBlock");
  const [bubbleLayouts, setBubbleLayouts] = useState<Partial<Record<TutorialStep, Layout>>>();
  const [highlightLayouts, setHighlightLayouts] = useState<Partial<Record<TutorialStep, Layout>>>();
  const [visible, setVisible] = useState(false);
  const { registerObserver, unregisterObserver } = useEventManager();
  const advanceStep = useCallback(() => {
    setStep(prev => (prev === "mineBlock" ? "transactions" : "completed"));
  }, []);

  const registerHighlightLayout = useCallback(
    (stepKey: TutorialStep, layout: Layout) => {
    setHighlightLayouts(prev => {
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

  const registerBubbleLayout = useCallback(
    (stepKey: TutorialStep, layout: Layout) => {
    setBubbleLayouts(prev => {
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
    <TutorialContext.Provider value={{ step, advanceStep, registerHighlightLayout, registerBubbleLayout, bubbleLayouts, highlightLayouts, visible, setVisible, isTutorialActive }}>
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
