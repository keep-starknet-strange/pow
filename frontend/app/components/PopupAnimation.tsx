import React, { useEffect } from "react";
import { Text, View, Easing, Animated, useAnimatedValue } from "react-native";

export type PopupAnimationProps = {
  popupStartTime?: number;
  popupValue: string;
  color?: string;
  animRange?: [number, number];
};

export const PopupAnimation: React.FC<PopupAnimationProps> = ({
  popupStartTime,
  popupValue,
  color,
  animRange,
}) => {
  const popupAnimation = useAnimatedValue(0);
  useEffect(() => {
    if (!popupStartTime) return;
    // Reset the animation value
    popupAnimation.setValue(0);
    Animated.timing(popupAnimation, {
      toValue: 100,
      duration: 400,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
    return () => {
      popupAnimation.removeAllListeners();
    };
  }, [popupStartTime]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        alignSelf: "center",
        transform: [
          {
            translateY: popupAnimation.interpolate({
              inputRange: [0, 100],
              outputRange: animRange || [-10, -50],
            }),
          },
        ],
        opacity: popupAnimation.interpolate({
          inputRange: [0, 1, 100],
          outputRange: [0, 1, 0],
        }),
        zIndex: 10,
      }}
    >
      <Text
        className="text-3xl font-Pixels"
        style={{
          color: color || "black",
          textShadowColor: "black",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
          width: 200,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {popupValue}
      </Text>
    </Animated.View>
  );
};

export default PopupAnimation;
