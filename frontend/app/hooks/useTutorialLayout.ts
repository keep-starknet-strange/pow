import { useRef, useCallback } from "react";
import { View } from "react-native";
import { useTutorial, TutorialStep } from "../context/Tutorial";

type TutorialLayoutType = "highlight" | "bubble";

export function useTutorialLayout(
  stepKey: TutorialStep,
  types: TutorialLayoutType | TutorialLayoutType[],
  enabled: boolean = true
) {
  const ref = useRef<View>(null);
  const { step, registerHighlightLayout, registerBubbleLayout, isTutorialActive } = useTutorial();

  const typeList = Array.isArray(types) ? types : [types];

  const onLayout = useCallback(() => {
    if (!enabled || !isTutorialActive || step !== stepKey) return;

    ref.current?.measureInWindow((x, y, width, height) => {
      if (typeList.includes("highlight")) {
        registerHighlightLayout(stepKey, { x, y, width, height });
      }
      if (typeList.includes("bubble")) {
        registerBubbleLayout(stepKey, { x, y, width, height });
      }
    });
  }, [stepKey,  typeList.join(","), isTutorialActive, registerHighlightLayout, registerBubbleLayout]);

  return { ref, onLayout };
}
