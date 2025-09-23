import { useAnimationsStore } from "../stores/useAnimationsStore";

export type AnimationIntensity = "full" | "reduced" | "none";

export interface AnimationConfig {
  shouldAnimate: boolean;
  animationIntensity: AnimationIntensity;
  shouldUseReducedMotion: boolean;
}

/**
 * Hook for centralized animation control throughout the app.
 * Components should use this to determine if and how they should animate.
 */
export const useAnimationConfig = (): AnimationConfig => {
  const { animationLevel } = useAnimationsStore();

  // TODO: In the future, we could also check system preferences for reduced motion
  // const reduceMotion = useReducedMotion(); // From react-native-reanimated or system settings

  const shouldAnimate = animationLevel !== "off";
  const shouldUseReducedMotion = animationLevel === "reduced";

  let animationIntensity: AnimationIntensity;
  if (animationLevel === "off") {
    animationIntensity = "none";
  } else if (animationLevel === "reduced") {
    animationIntensity = "reduced";
  } else {
    animationIntensity = "full";
  }

  return {
    shouldAnimate,
    animationIntensity,
    shouldUseReducedMotion,
  };
};
