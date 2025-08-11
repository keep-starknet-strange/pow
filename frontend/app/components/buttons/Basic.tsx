import React from "react";
import { View, TouchableWithoutFeedback, Text } from "react-native";
import { useEventManager } from "@/app/stores/useEventManager";
import { useImages } from "../../hooks/useImages";
import {
  Canvas,
  Image,
  ImageShader,
  Rect,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

type BasicButtonProps = {
  label: string;
  onPress?: () => void;
  style?: object;
  textStyle?: object;
  icon?: string;
  disabled?: boolean;
};

const BasicButton: React.FC<BasicButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
  icon,
  disabled = false,
}) => {
  const { getImage } = useImages();
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
    <Animated.View style={[shakeAnimStyle]}>
      <TouchableWithoutFeedback
        onPress={() => {
          notify("BasicClick");
          // eslint-disable-next-line react-hooks/react-compiler
          shakeAnim.value *= -1; // Toggle the shake direction
          onPress?.();
        }}
        disabled={disabled}
      >
        <View
          className="relative"
          style={{
            width: 254,
            height: 46,
            ...style,
          }}
        >
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getImage("button.basic")}
              fit="fill"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              x={0}
              y={0}
              width={254}
              height={46}
            />
          </Canvas>
          <Text
            className={`
            absolute top-[6px] left-0 w-full h-full
            font-Teatime text-[36px] text-center
            ${disabled ? "text-gray-400" : "text-[#fff7ff]"}
          `}
            style={{
              ...textStyle,
            }}
          >
            {label}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

export default BasicButton;
