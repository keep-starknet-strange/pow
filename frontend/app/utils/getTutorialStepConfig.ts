import tutorialConfig from "../configs/tutorial.json";
import { TargetId } from "../stores/useTutorialStore";

export function getTutorialStepConfig(step: string): {
  title: string;
  description: string;
  bubbleTargetId: TargetId;
  highlightTargetId: TargetId;
  canDismiss: boolean;
} {
  return (
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
}
