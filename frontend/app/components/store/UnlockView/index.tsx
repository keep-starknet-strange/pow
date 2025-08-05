import React from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { UnlockBackground } from "./UnlockBackground";
import { UnlockIcon } from "./UnlockIcon";
import { UnlockDetails } from "./UnlockDetails";
import { useEventManager } from "@/app/stores/useEventManager";

type UnlockViewProps = {
  icon: string;
  label: string;
  description: string;
  cost: number;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
};

export const UnlockView: React.FC<UnlockViewProps> = React.memo((props) => {
  const { notify } = useEventManager();
  const shakeAnim = useSharedValue(8);

  const shakeAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSequence(
          withTiming(Math.abs(shakeAnim.value), {
            duration: 100,
            easing: Easing.linear,
          }),
          withTiming(0, {
            duration: 50,
            easing: Easing.linear,
          }),
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[shakeAnimStyle, props.style]}
      className="flex items-center justify-center"
      entering={FadeInDown}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          notify("BasicClick");
          props.onPress();
          shakeAnim.value *= -1; // Toggle the shake direction
        }}
        disabled={props.disabled}
      >
        <View
          className="relative"
          style={{
            ...props.style,
          }}
        >
          <UnlockBackground />
          <View className="absolute flex flex-row items-start px-[48px] py-[8px]">
            <UnlockIcon icon={props.icon} />
            <UnlockDetails
              label={props.label}
              description={props.description}
              cost={props.cost}
              textStyle={props.textStyle}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
});
