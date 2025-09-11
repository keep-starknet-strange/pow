import React, { useImperativeHandle, forwardRef } from "react";
import { Text, View, Easing, Animated, useAnimatedValue } from "react-native";

export type PopupAnimationRef = {
  showPopup: (value: string, color?: string) => void;
};

export type PopupAnimationProps = {
  animRange?: [number, number];
};

export const PopupAnimation = forwardRef<
  PopupAnimationRef,
  PopupAnimationProps
>(({ animRange }, ref) => {
  const popupAnimation = useAnimatedValue(0);
  const [popupValue, setPopupValue] = React.useState("");
  const [color, setColor] = React.useState<string | undefined>();

  useImperativeHandle(ref, () => ({
    showPopup: (value: string, color?: string) => {
      setPopupValue(value);
      setColor(color);
      // Reset the animation value
      popupAnimation.setValue(0);
      Animated.timing(popupAnimation, {
        toValue: 100,
        duration: 400,
        easing: Easing.bounce,
        useNativeDriver: true,
      }).start();
    },
  }));

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        alignSelf: "center",
        pointerEvents: "none",
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
        className="text-2xl font-Xerxes"
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
});

export default PopupAnimation;
