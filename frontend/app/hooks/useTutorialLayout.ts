import { useRef, useCallback } from "react";
import { View } from "react-native";
import { useTutorial, TargetId } from "../context/Tutorial";
import tutorialConfig from "../configs/tutorial.json";

export function useTutorialLayout(
  id: TargetId,
  enabled: boolean = true
) {
  const ref = useRef<View>(null);
  const { step, registerLayout, isTutorialActive } = useTutorial();
  const stepTargets = [tutorialConfig[step]["bubbleTargetId"], tutorialConfig[step]["highlightTargetId"]];

  const onLayout = useCallback(() => {
    if (!enabled || !isTutorialActive || !stepTargets.includes(id.toString())) return;

    ref.current?.measureInWindow((x, y, width, height) => {
      registerLayout(id, { x, y, width, height });
    });
  }, [id, isTutorialActive, registerLayout]);

  return { ref, onLayout };
}
