import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  Easing,
  runOnUI,
  withDelay,
  runOnJS,
} from "react-native-reanimated";

interface FlashBurstProps {
  x: number; // Click position X
  y: number; // Click position Y
  trigger: number; // Timestamp to trigger animation
  renderedBy?: string; // "miner", "sequencer", "da", "prover"
  onComplete?: () => void;
}

interface StreakProps {
  angle: number;
  length: number;
  delay: number;
  x: number;
  y: number;
  trigger: number;
  color: string;
}

interface TextParticleProps {
  x: number;
  y: number;
  trigger: number;
  text: string;
  angle: number;
  distance: number;
  delay: number;
  color: string;
}

const Streak: React.FC<StreakProps> = ({
  angle,
  length,
  delay,
  x,
  y,
  trigger,
  color,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateDistance = useSharedValue(0);
  const lengthScale = useSharedValue(1);

  // Create worklet for animation calculations
  const startStreakAnimation = () => {
    "worklet";
    // Reset values
    opacity.value = 0;
    scale.value = 0;
    translateDistance.value = 0;
    lengthScale.value = 1;

    // Start animations with proper delay using withDelay
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }),
      ),
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0.3, { duration: 200, easing: Easing.in(Easing.quad) }),
      ),
    );
    translateDistance.value = withDelay(
      delay,
      withTiming(length, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      }),
    );
    // Dynamic length scaling - starts normal, grows, then shrinks
    lengthScale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.5, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(0.8, { duration: 150, easing: Easing.in(Easing.quad) }),
      ),
    );
  };

  useEffect(() => {
    if (trigger > 0) {
      runOnUI(startStreakAnimation)();
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const radians = ((angle + 90) * Math.PI) / 180;
    const translateX = Math.cos(radians) * translateDistance.value;
    const translateY = Math.sin(radians) * translateDistance.value;

    return {
      opacity: opacity.value,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${angle}deg` }, // Rotate the streak to point in the direction it's moving
        { scaleX: scale.value },
        { scaleY: scale.value * lengthScale.value }, // Apply dynamic length scaling
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x - 2, // Center the streak origin
          top: y - 15, // Center the streak origin
          width: 4,
          height: 40, // Made longer as requested
          backgroundColor: color,
          borderRadius: 2,
          shadowColor: color,
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

const FlashCore: React.FC<{
  x: number;
  y: number;
  trigger: number;
  color: string;
}> = ({ x, y, trigger, color }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  const startFlashAnimation = () => {
    "worklet";
    // Reset values
    opacity.value = 0;
    scale.value = 0;

    // Flash sequence: bright flash then fade
    opacity.value = withSequence(
      withTiming(1, { duration: 50, easing: Easing.out(Easing.quad) }),
      withTiming(0.8, { duration: 100, easing: Easing.linear }),
      withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) }),
    );

    scale.value = withSequence(
      withTiming(1.5, { duration: 50, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 100, easing: Easing.linear }),
      withTiming(0.5, { duration: 250, easing: Easing.in(Easing.quad) }),
    );
  };

  useEffect(() => {
    if (trigger > 0) {
      runOnUI(startFlashAnimation)();
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x - 15,
          top: y - 15,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "#FFFFFF",
          shadowColor: color,
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

const TextParticle: React.FC<TextParticleProps> = ({
  x,
  y,
  trigger,
  text,
  angle,
  distance,
  delay,
  color,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateDistance = useSharedValue(0);

  const startTextParticleAnimation = () => {
    "worklet";
    // Reset values
    opacity.value = 0;
    scale.value = 0;
    translateDistance.value = 0;

    // Start animations with proper delay using withDelay
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0.8, { duration: 100, easing: Easing.linear }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }),
      ),
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0.8, { duration: 100, easing: Easing.linear }),
        withTiming(0.3, { duration: 200, easing: Easing.in(Easing.quad) }),
      ),
    );
    translateDistance.value = withDelay(
      delay,
      withTiming(distance, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      }),
    );
  };

  useEffect(() => {
    if (trigger > 0) {
      runOnUI(startTextParticleAnimation)();
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const radians = (angle * Math.PI) / 180;
    const translateX = Math.cos(radians) * translateDistance.value;
    const translateY = Math.sin(radians) * translateDistance.value;

    return {
      opacity: opacity.value,
      transform: [{ translateX }, { translateY }, { scale: scale.value }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x - 15, // Center the text
          top: y - 8,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Pixels",
          color: color,
          textShadowColor: "#000",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}
      >
        {text}
      </Text>
    </Animated.View>
  );
};

export const FlashBurst: React.FC<FlashBurstProps> = ({
  x,
  y,
  trigger,
  renderedBy,
  onComplete,
}) => {
  const containerOpacity = useSharedValue(0);

  // Get text and color based on confirmer type
  const getParticleText = (): string => {
    switch (renderedBy) {
      case "miner":
      case "sequencer":
        return "POW!";
      case "prover":
        return "Prove!";
      case "da":
        return "Store!";
      default:
        return "POW!";
    }
  };

  const getParticleColor = (): string => {
    switch (renderedBy) {
      case "miner":
        return "#FFD700"; // Gold for mining
      case "sequencer":
        return "#4A9EFF"; // Blue for sequencing
      case "prover":
        return "#B347FF"; // More purple for proving
      case "da":
        return "#8B47FF"; // Deep purple for data availability
      default:
        return "#FFD700"; // Gold default
    }
  };

  // Get streak and flash colors (slightly different from text for variety)
  const getStreakColor = (): string => {
    switch (renderedBy) {
      case "miner":
        return "#FFD700"; // Gold streaks for mining
      case "sequencer":
        return "#4A9EFF"; // Blue streaks for sequencing
      case "prover":
        return "#A347FF"; // Purple streaks for proving
      case "da":
        return "#7A47FF"; // Deep purple streaks for data availability
      default:
        return "#FFD700"; // Gold default
    }
  };

  const particleText = getParticleText();
  const particleColor = getParticleColor();
  const streakColor = getStreakColor();

  const startContainerAnimation = () => {
    "worklet";
    containerOpacity.value = 1;

    // Auto-hide after animation completes using withDelay
    containerOpacity.value = withDelay(
      450,
      withTiming(0, { duration: 0 }, (finished) => {
        if (finished && onComplete) {
          // Use runOnJS to call the completion callback
          runOnJS(onComplete)();
        }
      }),
    );
  };

  useEffect(() => {
    if (trigger > 0) {
      runOnUI(startContainerAnimation)();
    }
  }, [trigger]);

  const containerStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: containerOpacity.value,
    };
  });

  // Generate random streaks
  const streaks = React.useMemo(() => {
    const streakCount = 8 + Math.floor(Math.random() * 4); // 8-12 streaks
    return Array.from({ length: streakCount }, (_, index) => {
      // Distribute evenly around the circle with some random variation
      const baseAngle = (360 / streakCount) * index;
      const randomVariation = (Math.random() - 0.5) * 30; // ±15 degrees variation
      return {
        angle: baseAngle + randomVariation,
        length: 70 + Math.random() * 50, // Random length 70-120
        delay: Math.random() * 50, // Random delay 0-50ms
      };
    });
  }, [trigger]);

  // Generate random text particles
  const textParticles = React.useMemo(() => {
    const particleCount = 4 + Math.floor(Math.random() * 3); // 4-6 particles as requested
    return Array.from({ length: particleCount }, (_, index) => {
      const angle = Math.random() * 360; // Completely random angles
      return {
        angle,
        distance: 40 + Math.random() * 30, // Random distance 40-70px
        delay: Math.random() * 100, // Random delay 0-100ms
      };
    });
  }, [trigger]);

  if (trigger === 0) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        },
        containerStyle,
      ]}
    >
      {/* Central flash */}
      <FlashCore x={x} y={y} trigger={trigger} color={particleColor} />

      {/* Streaks */}
      {streaks.map((streak, index) => (
        <Streak
          key={`${trigger}-streak-${index}`}
          angle={streak.angle}
          length={streak.length}
          delay={streak.delay}
          x={x}
          y={y}
          trigger={trigger}
          color={streakColor}
        />
      ))}

      {/* Text particles */}
      {textParticles.map((particle, index) => (
        <TextParticle
          key={`${trigger}-text-${index}`}
          x={x}
          y={y}
          trigger={trigger}
          text={particleText}
          angle={particle.angle}
          distance={particle.distance}
          delay={particle.delay}
          color={particleColor}
        />
      ))}
    </Animated.View>
  );
};
