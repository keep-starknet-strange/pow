import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";

interface TxFlashBurstProps {
  x: number; // Click position X
  y: number; // Click position Y
  trigger: number; // Timestamp to trigger animation
  chainId: number;
  txId: number;
  isDapp: boolean;
  onComplete?: () => void;
}

interface TxStreakProps {
  angle: number;
  length: number;
  delay: number;
  x: number;
  y: number;
  trigger: number;
  color: string;
}

// Color mapping from config color names to hex values
const colorMap: Record<string, string> = {
  green: "#20DF20",
  blue: "#4A9EFF",
  yellow: "#FFD700",
  pink: "#FF69B4",
  purple: "#9A4AFF",
};

const TxStreak: React.FC<TxStreakProps> = ({
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

  useEffect(() => {
    if (trigger > 0) {
      opacity.value = 0;
      scale.value = 0;
      translateDistance.value = 0;
      lengthScale.value = 1;

      // Start animation with delay - less intense than block animation
      setTimeout(() => {
        opacity.value = withSequence(
          withTiming(0.8, { duration: 80, easing: Easing.out(Easing.quad) }), // Less intense opacity
          withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) }),
        );
        scale.value = withSequence(
          withTiming(0.8, { duration: 80, easing: Easing.out(Easing.quad) }), // Smaller scale
          withTiming(0.2, { duration: 150, easing: Easing.in(Easing.quad) }),
        );
        translateDistance.value = withTiming(length * 0.7, {
          // Shorter distance
          duration: 230,
          easing: Easing.out(Easing.quad),
        });
        // Dynamic length scaling - less dramatic
        lengthScale.value = withSequence(
          withTiming(1.3, { duration: 115, easing: Easing.out(Easing.quad) }),
          withTiming(0.6, { duration: 115, easing: Easing.in(Easing.quad) }),
        );
      }, delay);
    }
  }, [trigger, delay, length, lengthScale, opacity, scale, translateDistance]);

  const animatedStyle = useAnimatedStyle(() => {
    const radians = ((angle + 90) * Math.PI) / 180;
    const translateX = Math.cos(radians) * translateDistance.value;
    const translateY = Math.sin(radians) * translateDistance.value;

    return {
      opacity: opacity.value,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${angle}deg` },
        { scaleX: scale.value },
        { scaleY: scale.value * lengthScale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x - 1.5,
          top: y - 10,
          width: 3,
          height: 20, // Smaller than block streaks
          backgroundColor: color,
          borderRadius: 1.5,
          shadowColor: "black",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 3,
          elevation: 4,
        },
        animatedStyle,
      ]}
    />
  );
};

const TxFlashCore: React.FC<{
  x: number;
  y: number;
  trigger: number;
  color: string;
}> = ({ x, y, trigger, color }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (trigger > 0) {
      opacity.value = 0;
      scale.value = 0;

      // Flash sequence: less intense than block flash
      opacity.value = withSequence(
        withTiming(0.8, { duration: 30, easing: Easing.out(Easing.quad) }),
        withTiming(0.6, { duration: 70, easing: Easing.linear }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }),
      );

      scale.value = withSequence(
        withTiming(1.2, { duration: 30, easing: Easing.out(Easing.quad) }), // Smaller flash
        withTiming(0.8, { duration: 70, easing: Easing.linear }),
        withTiming(0.3, { duration: 200, easing: Easing.in(Easing.quad) }),
      );
    }
  }, [trigger, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x - 10,
          top: y - 10,
          width: 20, // Smaller than block flash
          height: 20,
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 5,
          elevation: 8,
        },
        animatedStyle,
      ]}
    />
  );
};

export const TxFlashBurst: React.FC<TxFlashBurstProps> = ({
  x,
  y,
  trigger,
  chainId,
  txId,
  isDapp,
  onComplete,
}) => {
  const containerOpacity = useSharedValue(0);

  // Get transaction color from config
  const getTransactionColor = (): string => {
    try {
      if (isDapp) {
        const dappTransactions =
          chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
        const txType = dappTransactions.find((tx) => tx.id === txId);
        return colorMap[txType?.color || "blue"] || "#4A9EFF";
      } else {
        const chainTransactions =
          chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
        const txType = chainTransactions.find((tx) => tx.id === txId);
        return colorMap[txType?.color || "green"] || "#20DF20";
      }
    } catch {
      return "#20DF20"; // Default green
    }
  };

  const transactionColor = getTransactionColor();

  useEffect(() => {
    if (trigger > 0) {
      containerOpacity.value = 1;

      // Auto-hide after animation completes - shorter than block animation
      setTimeout(() => {
        containerOpacity.value = 0;
        onComplete?.();
      }, 350);
    }
  }, [trigger]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  // Generate random streaks - fewer than blocks
  const streaks = React.useMemo(() => {
    const streakCount = 6 + Math.floor(Math.random() * 3); // 6-8 streaks (fewer than blocks)
    return Array.from({ length: streakCount }, (_, index) => {
      const baseAngle = (360 / streakCount) * index;
      const randomVariation = (Math.random() - 0.5) * 25; // ±12.5 degrees
      return {
        angle: baseAngle + randomVariation,
        length: 30 + Math.random() * 25, // Random length 30-55px (shorter than blocks)
        delay: Math.random() * 30, // Random delay 0-30ms
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
      <TxFlashCore x={x} y={y} trigger={trigger} color={transactionColor} />

      {/* Streaks */}
      {streaks.map((streak, index) => (
        <TxStreak
          key={`${trigger}-${index}`}
          angle={streak.angle}
          length={streak.length}
          delay={streak.delay}
          x={x}
          y={y}
          trigger={trigger}
          color={transactionColor}
        />
      ))}
    </Animated.View>
  );
};
