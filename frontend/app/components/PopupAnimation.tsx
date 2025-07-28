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
      className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
      style={{
        transform: [
          {
            translateY: popupAnimation.interpolate({
              inputRange: [0, 100],
              outputRange: animRange || [-50, -80],
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
        className="text-3xl text-center font-Pixels"
        style={{
          color: color || "black",
          textShadowColor: "black",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}
      >
        {popupValue}
      </Text>
    </Animated.View>
  );
};

export default PopupAnimation;
