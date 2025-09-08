import React, { memo, use, useEffect, useState } from "react";
import { View, Pressable, Text, Button } from "react-native";
import { useEventManager } from "@/app/stores/useEventManager";
import { useImages } from "../hooks/useImages";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
import { shortMoneyString } from "../utils/helpers";
import Feather from '@expo/vector-icons/Feather';
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
  useDerivedValue,
  interpolate,
  Extrapolation,
  withRepeat,
  withSpring,
} from "react-native-reanimated";
import { useBalanceStore } from "../stores/useBalanceStore";

export type FeatureUnlockView = {
  label: string;
  description: string;
  cost: number;
  onPress: () => void;
  hidden: boolean;
  disabled?: boolean;
  disableMinimize?: boolean
};

enum NotificationState {
  Expanded,
  Collapsed,
}

export const FeatureUnlockView: React.FC<FeatureUnlockView> = memo(
  (props) => {
    const [collapseState, setCollapseState] = useState(NotificationState.Expanded);
    const [canAffordFeature, setCanAffordFeature] = useState(false);
    const { balance } = useBalanceStore();
    const { getImage } = useImages();
    const { notify } = useEventManager();
    const { width: windowWidth } = useCachedWindowDimensions();

    const shakeAnim = useSharedValue(0);
    const minimizeAnim = useSharedValue(0);
    const shakeBadgeAnim = useSharedValue(0);
    const hideAnim = useSharedValue(1);

    useEffect(() => {
      if (collapseState === NotificationState.Expanded) {
        minimizeAnim.value = withTiming(0, { duration: 300 });
      } else if (collapseState === NotificationState.Collapsed) {
        minimizeAnim.value = withTiming(1, { duration: 300 });
      }
    }, [collapseState])

    const badgeAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        minimizeAnim.value,
        [0, 1],
        [0, 1],
        Extrapolation.IDENTITY
      ),
      transform: [
        {
          translateY: shakeBadgeAnim.value
        },
        {
          translateX: interpolate(
            minimizeAnim.value,
            [0, 1],
            [0, windowWidth - 64],
            Extrapolation.CLAMP
          )
        }
      ],
    }));

    const notificationAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        minimizeAnim.value,
        [0, 1],
        [1, 0],
        Extrapolation.IDENTITY
      ),
      transform: [
        {
          translateY: withSequence(
            withTiming(shakeAnim.value, {
              duration: 100,
              easing: Easing.linear,
            }),
            withTiming(0, {
              duration: 50,
              easing: Easing.linear,
            }, () => shakeAnim.value = 0),
          ),
        },
        {
          translateX: interpolate(
            minimizeAnim.value,
            [0, 1],
            [0, windowWidth - 64],
            Extrapolation.EXTEND
          )
        }
      ],
    }));

    const hideAnimatedStyle = useAnimatedStyle((() => (
      { opacity: hideAnim.value }
    )))

    useEffect(() => {
      setCanAffordFeature(balance >= props.cost);
    }, [balance, props.cost]);

    useEffect(() => {
      hideAnim.value = withTiming(props.hidden ? 0 : 1, { duration: 150 })
    }, [props.hidden])

    useEffect(() => {
      if (canAffordFeature && collapseState === NotificationState.Collapsed) {
        shakeBadgeAnim.value = withRepeat(
          withSequence(
            withTiming(2, { duration: 200, easing: Easing.ease }),
            withTiming(-2, { duration: 200, easing: Easing.ease })
          ), 
          -1, 
          true
        )
      } else {
        shakeBadgeAnim.value = 0
      }
    }, [canAffordFeature, collapseState])

    return (
      <Animated.View 
        style={[hideAnimatedStyle, { zIndex: 100 }]}
      >
        <Animated.View
          style={[notificationAnimatedStyle]}
          className="absolute bottom-0 px-2"
          entering={FadeInDown}
          exiting={FadeOutDown}
        >
          <View>
            <Pressable
              className="relative"
              disabled={props.disabled}
              onPress={() => {
                notify("BasicClick");
                props.onPress();
                if (shakeAnim.value === 0) {
                  shakeAnim.value = 8;
                } else {
                  shakeAnim.value *= -1;
                }
              }
              }
            >
              <Canvas style={{ width: windowWidth - 10, height: 55 }}>
                <Image
                  image={getImage("notif.unlock")}
                  fit="contain"
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  x={0}
                  y={0}
                  width={windowWidth - 10}
                  height={55}
                />
              </Canvas>
              <View className="absolute top-[4px]" style={{ left: windowWidth * 0.13 }}>
                <Text className="text-[18px] font-Pixels text-[#fff7ff]">
                  {props.label}
                </Text>
              </View>
              <View
                className="absolute bottom-[10px]"
                style={{ left: windowWidth * 0.13 }}
              >
                <Text className="text-[18px] font-Pixels text-[#fff7ff]">
                  {props.description}
                </Text>
              </View>
              <View
                className="absolute bottom-[10px] flex flex-row"
                style={{ right: 4 }}
              >
                <Text className="text-[18px] font-Pixels text-[#fff7ff]">
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

            {props.disableMinimize !== true && (
              <Pressable 
                className="absolute top-[-5] left-[-5] bg-[#8a1aef] border-[#33007e] rounded-full border-2 p-1"
                onPress={() => {
                  setCollapseState(NotificationState.Collapsed)
                }}
              >
                <Feather
                  name="minimize-2"
                  size={12}
                  color="white"
                  onPress={() => {
                    setCollapseState(NotificationState.Collapsed)
                  }}
                />
              </Pressable>
            )}

          </View>
        </Animated.View>

        <Animated.View
          style={[badgeAnimatedStyle]}
          className="absolute bottom-0 px-2"
        >
          <Pressable
            className="relative"
            disabled={collapseState === NotificationState.Expanded}
            onPress={() => {
              setCollapseState(NotificationState.Expanded);
            }}
          >
            <Canvas style={{ width: 50, height: 50 }}>
              <Image
                image={getImage("notif.badge.min")}
                fit="contain"
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                x={0}
                y={0}
                width={50}
                height={50}
              />
            </Canvas>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    // Prevent re-render if props haven't changed
    return (
      prevProps.label === nextProps.label &&
      prevProps.cost === nextProps.cost &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.hidden == nextProps.hidden && 
      prevProps.disableMinimize == nextProps.disableMinimize
    );
  },
);
