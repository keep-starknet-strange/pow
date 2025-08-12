import tutorialConfig from "../configs/tutorial.json";
import { TargetId } from "../stores/useTutorialStore";

// Memoization cache for tutorial step configs
const stepConfigCache = new Map<
  string,
  {
    title: string;
    description: string;
    bubbleTargetId: TargetId;
    highlightTargetId: TargetId;
    canDismiss: boolean;
  }
>();

export function getTutorialStepConfig(step: string): {
  title: string;
  description: string;
  bubbleTargetId: TargetId;
  highlightTargetId: TargetId;
  canDismiss: boolean;
} {
  // Check cache first
  if (stepConfigCache.has(step)) {
    return stepConfigCache.get(step)!;
  }

  const config = (
    step in tutorialConfig
      ? tutorialConfig[step as keyof typeof tutorialConfig]
      : {
          title: "",
          description: "",
          bubbleTargetId: "",
          highlightTargetId: "",
          canDismiss: true,
        }
  ) as any;

  // Cache the result
  stepConfigCache.set(step, config);
  return config;
}
