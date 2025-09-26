import { useEffect, useState, useCallback } from "react";
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useAnimationConfig } from "./useAnimationConfig";

/**
 * Custom hook for handling completion animations on confirmer components
 * @param isBuilt - The actual isBuilt state from the store
 * @returns Object containing localIsBuilt state and animated style
 */
export const useCompletionAnimation = (isBuilt: boolean | undefined) => {
  const { shouldAnimate, animationIntensity } = useAnimationConfig();

  // Local state to control when confirmer disappears (delayed from actual isBuilt)
  const [localIsBuilt, setLocalIsBuilt] = useState(false);
  const [isCompletingAnimation, setIsCompletingAnimation] = useState(false);

  // Completion animation values
  const scaleAnim = useSharedValue(1);
  const opacityAnim = useSharedValue(1);
  const rotateAnim = useSharedValue(0);

  // Callback for when completion animation finishes
  const handleAnimationComplete = useCallback(() => {
    setLocalIsBuilt(false);
    setIsCompletingAnimation(false);
    // Reset animation values
    scaleAnim.value = 1;
    opacityAnim.value = 1;
    rotateAnim.value = 0;
  }, []);

  // Handle isBuilt changes with completion animation
  useEffect(() => {
    if (isBuilt && !localIsBuilt && !isCompletingAnimation) {
      // Component just became built, show confirmer immediately
      setLocalIsBuilt(true);
    } else if (!isBuilt && localIsBuilt && !isCompletingAnimation) {
      // Component was completed (isBuilt changed from true to false) - start completion animation
      setIsCompletingAnimation(true);

      if (!shouldAnimate) {
        // If animations are disabled, immediately hide without animation
        handleAnimationComplete();
        return;
      }

      // Adjust animation intensity based on settings
      const springIntensity = animationIntensity === "full" ? 1.3 : 1.15;
      const rotateIntensity = animationIntensity === "full" ? 5 : 3;
      const duration = animationIntensity === "full" ? 200 : 150;

      // Completion animation sequence (~600ms total)
      scaleAnim.value = withSequence(
        withSpring(springIntensity, { duration, dampingRatio: 0.6 }),
        withSpring(1.1, { duration, dampingRatio: 0.8 }),
        withTiming(
          0.8,
          {
            duration,
            easing: Easing.out(Easing.quad),
          },
          () => {
            // After animation completes, hide confirmer
            runOnJS(handleAnimationComplete)();
          },
        ),
      );

      opacityAnim.value = withSequence(
        withTiming(1, { duration: duration + 100 }),
        withTiming(0.7, { duration: duration - 50 }),
        withTiming(0, { duration: duration - 50 }),
      );

      rotateAnim.value = withSequence(
        withSpring(rotateIntensity, {
          duration: duration - 50,
          dampingRatio: 0.7,
        }),
        withSpring(-rotateIntensity * 0.6, {
          duration: duration - 50,
          dampingRatio: 0.7,
        }),
        withSpring(0, { duration: duration - 50, dampingRatio: 0.8 }),
        withTiming(0, { duration: duration - 50 }),
      );
    }
  }, [
    isBuilt,
    localIsBuilt,
    isCompletingAnimation,
    handleAnimationComplete,
    shouldAnimate,
    animationIntensity,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleAnim.value },
        { rotate: `${rotateAnim.value}deg` },
      ],
      opacity: opacityAnim.value,
    };
  });

  return {
    localIsBuilt,
    animatedStyle,
  };
};
