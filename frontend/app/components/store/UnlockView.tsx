import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableWithoutFeedback, Text, Platform } from "react-native";
import { useEventManager } from "@/app/stores/useEventManager";
import { useImages } from "../../hooks/useImages";
import { useCachedWindowDimensions } from "../../hooks/useCachedDimensions";
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
  const { width } = useCachedWindowDimensions();

  // Get the images and check if they're loaded
  const iconImage = useMemo(() => getImage(props.icon), [getImage, props.icon]);
  const buttonImage = useMemo(() => getImage("button.secondary"), [getImage]);

  // iOS-specific: Force re-render when icon is loaded
  const [forceUpdate, setForceUpdate] = useState(0);
  useEffect(() => {
    if (Platform.OS === "ios" && iconImage && buttonImage) {
      const timer = setTimeout(() => {
        setForceUpdate((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [iconImage, buttonImage]);

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
          {buttonImage && (
            <Canvas
              style={{ width: width - 32, height: 92 }}
              key={`unlock-bg-${forceUpdate}`}
            >
              <Image
                image={buttonImage}
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
          )}
          <View className="absolute flex flex-row items-start px-[48px] py-[8px]">
            {iconImage && (
              <Canvas
                style={{ width: 64, height: 92 }}
                key={`unlock-icon-${props.icon}-${forceUpdate}`}
              >
                <Image
                  image={iconImage}
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
            )}
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
