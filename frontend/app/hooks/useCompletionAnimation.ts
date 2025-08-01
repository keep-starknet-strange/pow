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

/**
 * Custom hook for handling completion animations on confirmer components
 * @param isBuilt - The actual isBuilt state from the store
 * @returns Object containing localIsBuilt state and animated style
 */
export const useCompletionAnimation = (isBuilt: boolean | undefined) => {
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

      // Completion animation sequence (~600ms total)
      scaleAnim.value = withSequence(
        withSpring(1.3, { duration: 200, dampingRatio: 0.6 }),
        withSpring(1.1, { duration: 200, dampingRatio: 0.8 }),
        withTiming(
          0.8,
          {
            duration: 200,
            easing: Easing.out(Easing.quad),
          },
          () => {
            // After animation completes, hide confirmer
            runOnJS(handleAnimationComplete)();
          },
        ),
      );

      opacityAnim.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.7, { duration: 150 }),
        withTiming(0, { duration: 150 }),
      );

      rotateAnim.value = withSequence(
        withSpring(5, { duration: 150, dampingRatio: 0.7 }),
        withSpring(-3, { duration: 150, dampingRatio: 0.7 }),
        withSpring(0, { duration: 150, dampingRatio: 0.8 }),
        withTiming(0, { duration: 150 }),
      );
    }
  }, [isBuilt, localIsBuilt, isCompletingAnimation, handleAnimationComplete]);

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
