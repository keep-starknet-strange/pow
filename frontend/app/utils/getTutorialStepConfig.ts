import tutorialConfig from "../configs/tutorial.json";
import { TargetId } from "../stores/useTutorialStore";

export function getTutorialStepConfig(step: string): {
  title: string;
  description: string;
  bubbleTargetId: TargetId;
  highlightTargetId: TargetId;
} {
  return (
    step in tutorialConfig
      ? tutorialConfig[step as keyof typeof tutorialConfig]
      : {
          title: "",
          description: "",
          bubbleTargetId: "",
          highlightTargetId: "",
        }
  ) as any;
}
