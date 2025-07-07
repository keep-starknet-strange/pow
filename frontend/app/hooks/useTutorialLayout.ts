import { useRef, useCallback, useEffect } from "react";
import { View, InteractionManager, Platform } from "react-native";
import { useTutorial, TargetId } from "../stores/useTutorialStore";
import tutorialConfig from "../configs/tutorial.json";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useTutorialLayout(id: TargetId, enabled: boolean = true) {
  const ref = useRef<View>(null);
  const { step, registerLayout, isTutorialActive } = useTutorial();
  const insets = useSafeAreaInsets();
  const { bubbleTargetId, highlightTargetId } = tutorialConfig[step];
  const stepTargets = [bubbleTargetId, highlightTargetId];

  const measure = useCallback(() => {
    if (!enabled || !isTutorialActive || !stepTargets.includes(id.toString())) {
      return;
    }
    ref.current?.measureInWindow((x, y, width, height) => {
      // Based on this https://reactnative.dev/docs/dimensions#get
      // the y position is excluding the safe area on Android
      const actualY =
        Platform.select({
          ios: y,
          android: insets.top + y,
        }) ?? y;

      registerLayout(id, { top: x, left: actualY, width, height });
    });
  }, [
    enabled,
    isTutorialActive,
    registerLayout,
    step,
    id,
    stepTargets,
    insets,
  ]);

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
