import { useRef, useCallback, useEffect } from "react";
import { View, InteractionManager } from "react-native";
import { useTutorial, TargetId } from "../context/Tutorial";
import tutorialConfig from "../configs/tutorial.json";

export function useTutorialLayout(
  id: TargetId,
  enabled: boolean = true
) {
  const ref = useRef<View>(null);
  const { step, registerLayout, isTutorialActive } = useTutorial();

  const { bubbleTargetId, highlightTargetId } = tutorialConfig[step];
  const stepTargets = [bubbleTargetId, highlightTargetId];

  const measure = useCallback(() => {
    if (
      !enabled ||
      !isTutorialActive ||
      !stepTargets.includes(id.toString())
    ) {
      return;
    }
    ref.current?.measureInWindow((x, y, width, height) => {
      registerLayout(id, { x, y, width, height });
    });
  }, [enabled, isTutorialActive, registerLayout, step, id, stepTargets]);

  const onLayout = useCallback(() => {
    measure();
  }, [measure, step]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      measure();
    });
  }, [measure]);

  return { ref, onLayout };
}
