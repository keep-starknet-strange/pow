import React, { memo } from "react";
import { View, Dimensions, Pressable, Text } from "react-native";
import { useEventManager } from "@/app/stores/useEventManager";
import { useImages } from "../hooks/useImages";
import { shortMoneyString } from "../utils/helpers";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";

export type FeatureUnlockView = {
  label: string;
  description: string;
  cost: number;
  onPress: () => void;
  disabled?: boolean;
};

export const FeatureUnlockView: React.FC<FeatureUnlockView> = memo((props) => {
  const { getImage } = useImages();
  const { notify } = useEventManager();
  const { width } = Dimensions.get("window");

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
      style={[shakeAnimStyle]}
      className="flex items-center justify-center z-[45]"
      entering={FadeInDown}
      exiting={FadeOutDown}
    >
      <Pressable
        className="relative"
        onPress={() => {
          notify("BasicClick");
          props.onPress();
          shakeAnim.value *= -1; // Toggle the shake direction
        }}
        disabled={props.disabled}
      >
        <Canvas style={{ width: width - 10, height: 55 }}>
          <Image
            image={getImage("notif.unlock")}
            fit="fill"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={0}
            width={width - 10}
            height={55}
          />
        </Canvas>
        <View className="absolute top-[4px]" style={{ left: width * 0.13 }}>
          <Text
            className="text-[18px] font-Pixels text-[#fff7ff]"
          >
            {props.label}
          </Text>
        </View>
        <View className="absolute bottom-[10px]" style={{ left: width * 0.13 }}>
          <Text
            className="text-[18px] font-Pixels text-[#fff7ff]"
          >
            {props.description}
          </Text>
        </View>
        <View className="absolute bottom-[10px] flex flex-row" style={{ right: 4 }}>
          <Text
            className="text-[18px] font-Pixels text-[#fff7ff]"
          >
            {`Cost: ${shortMoneyString(props.cost)}`}
          </Text>
          <Canvas style={{ width: 16, height: 16 }} className="mr-1">
            <Image
              image={getImage("shop.btc")}
              fit="contain"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              x={0}
              y={1}
              width={13}
              height={13}
            />
          </Canvas>
        </View>
      </Pressable>
    </Animated.View>
  );
});
