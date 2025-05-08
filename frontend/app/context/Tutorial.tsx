import React, { createContext, useContext, useState, ReactNode } from "react";

type TutorialStep = "mine-block" | "transactions" | "completed";
interface Layout { x: number; y: number; width: number; height: number; }
interface TutorialContextType {
  step: TutorialStep;
  advanceStep: () => void;
  registerTargetLayout: (layout: Layout) => void;
  targetLayout?: Layout;
}
const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<TutorialStep>("mine-block");
  const [targetLayout, setTargetLayout] = useState<Layout>();
  const advanceStep = () => {
    setStep((prev) => {
      if (prev === "mine-block") return "transactions";
      return "completed";
    });
  };
  const registerTargetLayout = (layout: Layout) => setTargetLayout(layout);
  return (
    <TutorialContext.Provider value={{ step, advanceStep, registerTargetLayout, targetLayout }}>
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
