import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";

interface FlashBurstProps {
  x: number; // Click position X
  y: number; // Click position Y
  trigger: number; // Timestamp to trigger animation
  onComplete?: () => void;
}

interface StreakProps {
  angle: number;
  length: number;
  delay: number;
  x: number;
  y: number;
  trigger: number;
}

const Streak: React.FC<StreakProps> = ({ angle, length, delay, x, y, trigger }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateDistance = useSharedValue(0);

  useEffect(() => {
    if (trigger > 0) {
      opacity.value = 0;
      scale.value = 0;
      translateDistance.value = 0;

      // Start animation with delay
      setTimeout(() => {
        opacity.value = withSequence(
          withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })
        );
        scale.value = withSequence(
          withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }),
          withTiming(0.3, { duration: 200, easing: Easing.in(Easing.quad) })
        );
        translateDistance.value = withTiming(length, {
          duration: 300,
          easing: Easing.out(Easing.quad)
        });
      }, delay);
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    const radians = (angle * Math.PI) / 180;
    const translateX = Math.cos(radians) * translateDistance.value;
    const translateY = Math.sin(radians) * translateDistance.value;

    return {
      opacity: opacity.value,
      transform: [
        { translateX },
        { translateY },
        { scaleX: scale.value },
        { scaleY: scale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: 3,
          height: 20,
          backgroundColor: '#FFD700',
          borderRadius: 2,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
          elevation: 5,
        },
        animatedStyle,
      ]}
    />
  );
};

const FlashCore: React.FC<{ x: number; y: number; trigger: number }> = ({ x, y, trigger }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (trigger > 0) {
      opacity.value = 0;
      scale.value = 0;

      // Flash sequence: bright flash then fade
      opacity.value = withSequence(
        withTiming(1, { duration: 50, easing: Easing.out(Easing.quad) }),
        withTiming(0.8, { duration: 100, easing: Easing.linear }),
        withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
      );
      
      scale.value = withSequence(
        withTiming(1.5, { duration: 50, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 100, easing: Easing.linear }),
        withTiming(0.5, { duration: 250, easing: Easing.in(Easing.quad) })
      );
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - 15,
          top: y - 15,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: '#FFFFFF',
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 10,
        },
        animatedStyle,
      ]}
    />
  );
};

export const FlashBurst: React.FC<FlashBurstProps> = ({ x, y, trigger, onComplete }) => {
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    if (trigger > 0) {
      containerOpacity.value = 1;
      
      // Auto-hide after animation completes
      setTimeout(() => {
        containerOpacity.value = 0;
        onComplete?.();
      }, 450); // Slightly longer than animation duration for cleanup
    }
  }, [trigger]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  // Generate random streaks
  const streaks = React.useMemo(() => {
    const streakCount = 8 + Math.floor(Math.random() * 4); // 8-12 streaks
    return Array.from({ length: streakCount }, (_, index) => ({
      angle: (360 / streakCount) * index + Math.random() * 45 - 22.5, // Random variation
      length: 40 + Math.random() * 30, // Random length 40-70px
      delay: Math.random() * 50, // Random delay 0-50ms
    }));
  }, [trigger]);

  if (trigger === 0) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        },
        containerStyle,
      ]}
    >
      {/* Central flash */}
      <FlashCore x={x} y={y} trigger={trigger} />
      
      {/* Streaks */}
      {streaks.map((streak, index) => (
        <Streak
          key={`${trigger}-${index}`}
          angle={streak.angle}
          length={streak.length}
          delay={streak.delay}
          x={x}
          y={y}
          trigger={trigger}
        />
      ))}
    </Animated.View>
  );
}; 