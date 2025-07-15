import React from "react";
import { View, Dimensions, TouchableWithoutFeedback, Text } from "react-native";
import { useEventManager } from "../../context/EventManager";
import { useImages } from "../../hooks/useImages";
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
} from "react-native-reanimated";

export type UnlockViewProps = {
  icon: string;
  label: string;
  description: string;
  cost: number;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
};

export const UnlockView: React.FC<UnlockViewProps> = (props) => {
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
          <Canvas style={{ width: width - 32, height: 92 }}>
            <Image
              image={getImage("button.secondary")}
              fit="fill"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              x={0}
              y={0}
              width={width - 32}
              height={92}
            />
          </Canvas>
          <View className="absolute flex flex-row items-start px-[48px] py-[8px]">
            <Canvas style={{ width: 64, height: 92 }} className="">
              <Image
                image={getImage(props.icon)}
                fit="contain"
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                x={0}
                y={4}
                width={64}
                height={64}
              />
            </Canvas>
            <View className="flex flex-col items-start justify-start pl-[12px]">
              <Text
                className="text-[32px] font-Teatime text-[#fff7ff]"
                style={props.textStyle}
              >
                {props.label}
              </Text>
              <Text
                className="text-[20px] font-Teatime text-[#fff7ff]"
                style={props.textStyle}
              >
                {props.description}
              </Text>
              <View className="flex flex-row items-center justify-start">
                <Text
                  className="text-[20px] font-Teatime text-[#fff7ff]"
                  style={props.textStyle}
                >
                  {`Cost: ${props.cost}`}
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
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};
