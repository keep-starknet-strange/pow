import { useEventManager } from "@/app/stores/useEventManager";
import Feather from "@expo/vector-icons/Feather";
import {
  Canvas,
  FilterMode,
  Image,
  MipmapMode,
} from "@shopify/react-native-skia";
import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  FadeOutDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useImages } from "../hooks/useImages";
import { useBalanceStore } from "../stores/useBalanceStore";
import { shortMoneyString } from "../utils/helpers";

export type FeatureUnlockView = {
  label: string;
  description: string;
  cost: number;
  onPress: () => void;
  hidden: boolean;
  disabled?: boolean;
  disableMinimize?: boolean;
  marginHorizontal?: number;
};

enum NotificationState {
  Expanded,
  Collapsed,
}

export const FeatureUnlockView: React.FC<FeatureUnlockView> = memo(
  (props) => {
    const parentRef = useRef<Animated.View>(null);
    const [collapseState, setCollapseState] = useState(
      NotificationState.Expanded,
    );
    const [canAffordFeature, setCanAffordFeature] = useState(false);
    const [parentWidth, setParentWidth] = useState(0);
    const { balance } = useBalanceStore();
    const { getImage } = useImages();
    const { notify } = useEventManager();

    useLayoutEffect(() => {
      parentRef.current?.measure((_x, _y, width, _height) => {
        setParentWidth(width);
      });
    }, [setParentWidth]);

    const shakeAnim = useSharedValue(0);
    const minimizeAnim = useSharedValue(0);
    const shakeBadgeAnim = useSharedValue(0);
    const hideAnim = useSharedValue(1);

    const badgeAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        minimizeAnim.value,
        [0, 1],
        [0, 1],
        Extrapolation.IDENTITY,
      ),
      transform: [
        {
          translateY: shakeBadgeAnim.value,
        },
        {
          translateX: interpolate(
            minimizeAnim.value,
            [0, 1],
            [0, parentWidth - 50],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }));

    const notificationAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        minimizeAnim.value,
        [0, 1],
        [1, 0],
        Extrapolation.IDENTITY,
      ),
      transform: [
        {
          translateY: withSequence(
            withTiming(shakeAnim.value, {
              duration: 100,
              easing: Easing.linear,
            }),
            withTiming(
              0,
              {
                duration: 50,
                easing: Easing.linear,
              },
              () => (shakeAnim.value = 0),
            ),
          ),
        },
        {
          translateX: interpolate(
            minimizeAnim.value,
            [0, 1],
            [0, parentWidth - 50],
            Extrapolation.EXTEND,
          ),
        },
      ],
    }));

    const hideAnimatedStyle = useAnimatedStyle(() => ({
      opacity: hideAnim.value,
    }));

    useEffect(() => {
      if (collapseState === NotificationState.Expanded) {
        minimizeAnim.value = withTiming(0, { duration: 300 });
      } else if (collapseState === NotificationState.Collapsed) {
        minimizeAnim.value = withTiming(1, { duration: 300 });
      }
    }, [collapseState]);

    useEffect(() => {
      setCanAffordFeature(balance >= props.cost);
    }, [balance, props.cost]);

    useEffect(() => {
      hideAnim.value = withTiming(props.hidden ? 0 : 1, { duration: 150 });
    }, [props.hidden]);

    useEffect(() => {
      if (canAffordFeature && collapseState === NotificationState.Collapsed) {
        shakeBadgeAnim.value = withRepeat(
          withSequence(
            withTiming(2, { duration: 200, easing: Easing.ease }),
            withTiming(-2, { duration: 200, easing: Easing.ease }),
          ),
          -1,
          true,
        );
      } else {
        shakeBadgeAnim.value = 0;
      }
    }, [canAffordFeature, collapseState]);

    return (
      <Animated.View
        ref={parentRef}
        style={[
          hideAnimatedStyle,
          { zIndex: 100, marginHorizontal: props.marginHorizontal ?? 16 },
        ]}
      >
        <Animated.View
          style={[notificationAnimatedStyle]}
          className="absolute bottom-0"
          entering={FadeInDown}
          exiting={FadeOutDown}
        >
          <View>
            <Pressable
              disabled={props.disabled}
              onPress={() => {
                notify("BasicClick");
                props.onPress();
                if (shakeAnim.value === 0) {
                  shakeAnim.value = 8;
                } else {
                  shakeAnim.value *= -1;
                }
              }}
            >
              <Canvas style={{ width: parentWidth, height: 55 }}>
                <Image
                  image={getImage("notif.unlock")}
                  fit="contain"
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  x={0}
                  y={0}
                  width={parentWidth}
                  height={55}
                />
              </Canvas>
              <View
                className="absolute top-[4px]"
                style={{ left: parentWidth * 0.13 }}
              >
                <Text className="text-[18px] font-Pixels text-[#fff7ff]">
                  {props.label}
                </Text>
              </View>
              <View
                className="absolute bottom-[10px]"
                style={{ left: parentWidth * 0.13 }}
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
                  setCollapseState(NotificationState.Collapsed);
                }}
              >
                <Feather
                  name="minimize-2"
                  size={12}
                  color="white"
                  onPress={() => {
                    setCollapseState(NotificationState.Collapsed);
                  }}
                />
              </Pressable>
            )}
          </View>
        </Animated.View>

        <Animated.View style={[badgeAnimatedStyle]}>
          <Pressable
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
      prevProps.disableMinimize == nextProps.disableMinimize &&
      prevProps.marginHorizontal == nextProps.marginHorizontal
    );
  },
);
