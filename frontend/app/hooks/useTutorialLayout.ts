import { useRef, useCallback } from "react";
import { View } from "react-native";
import { useTutorial, TutorialStep } from "../context/Tutorial";

export function useTutorialLayout(
  stepKey: TutorialStep,
  type: "highlight" | "bubble",
  enabled: boolean = true
) {
  const ref = useRef<View>(null);
  const { step, registerHighlightLayout, registerBubbleLayout, isTutorialActive } = useTutorial();

  const onLayout = useCallback(() => {
    if (!enabled || !isTutorialActive || step !== stepKey) return;

    ref.current?.measureInWindow((x, y, width, height) => {
      if (type === "highlight") {
        registerHighlightLayout(stepKey, { x, y, width, height });
      } else {
        registerBubbleLayout(stepKey, { x, y, width, height });
      }
    });
  }, [stepKey, type, registerHighlightLayout, registerBubbleLayout]);

  return { ref, onLayout };
}
