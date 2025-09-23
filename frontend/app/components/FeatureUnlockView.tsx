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
import { Pressable, Text } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
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

    const translateXAnimation = useSharedValue(0);
    const shakeAnimation = useSharedValue(0);
    const opacityAnimation = useSharedValue(1);

    const translateXAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(
            translateXAnimation.value,
            [0, 1],
            [0, parentWidth - 50],
            Extrapolation.EXTEND,
          ),
        },
      ],
    }));

    const expandingItemsAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateXAnimation.value,
        [0, 1],
        [1, 0],
        Extrapolation.IDENTITY,
      ),
    }));

    const collapsingItemsAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateXAnimation.value,
        [0, 1],
        [0, 1],
        Extrapolation.IDENTITY,
      ),
    }));

    const parentStyle = useAnimatedStyle(() => ({
      opacity: opacityAnimation.value,
      transform: [
        {
          translateY: shakeAnimation.value,
        },
      ],
    }));

    useEffect(() => {
      if (collapseState === NotificationState.Expanded) {
        translateXAnimation.value = withTiming(0, { duration: 300 });
      } else if (collapseState === NotificationState.Collapsed) {
        translateXAnimation.value = withTiming(1, { duration: 300 });
      }
    }, [collapseState]);

    useEffect(() => {
      setCanAffordFeature(balance >= props.cost);
    }, [balance, props.cost]);

    useEffect(() => {
      opacityAnimation.value = withTiming(props.hidden ? 0 : 1, {
        duration: 150,
      });
    }, [props.hidden]);

    useEffect(() => {
      if (canAffordFeature && collapseState === NotificationState.Collapsed) {
        shakeAnimation.value = withRepeat(
          withSequence(
            withTiming(2, { duration: 200, easing: Easing.ease }),
            withTiming(-2, { duration: 200, easing: Easing.ease }),
          ),
          -1,
          true,
        );
      } else {
        shakeAnimation.value = 0;
      }
    }, [canAffordFeature, collapseState]);

    return (
      <Animated.View
        ref={parentRef}
        style={[
          parentStyle,
          { zIndex: 100, marginHorizontal: props.marginHorizontal ?? 16 },
        ]}
      >
        <Animated.View style={[translateXAnimatedStyle]}>
          <Pressable
            disabled={props.disabled}
            onPress={() => {
              if (collapseState === NotificationState.Expanded) {
                notify("BasicClick");
                props.onPress();

                shakeAnimation.value = withSequence(
                  withTiming(8, { duration: 100, easing: Easing.linear }),
                  withTiming(0, { duration: 50, easing: Easing.linear }),
                );
              } else {
                setCollapseState(NotificationState.Expanded);
              }
            }}
          >
            <Animated.View style={[expandingItemsAnimatedStyle]}>
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
            </Animated.View>

            {collapsingItemsAnimatedStyle.opacity !== -1 && (
              <Animated.View
                style={[collapsingItemsAnimatedStyle, { position: "absolute" }]}
              >
                <Canvas style={{ width: 48, height: 48, marginTop: 2 }}>
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
              </Animated.View>
            )}

            <Animated.View
              className="absolute top-[6px]"
              style={[
                expandingItemsAnimatedStyle,
                { 
                  left: parentWidth * 0.13,                  
                  flex: 1,
                  width: "86%",
                  height: "28%",
                  justifyContent: "center"
                },
              ]}
            >
              <Text 
                className="text-[18px] font-Pixels text-[#fff7ff]"
                adjustsFontSizeToFit={true}
                numberOfLines={1}
              >
                {props.label}
              </Text>
            </Animated.View>
            <Animated.View
              className="absolute bottom-[10px]"
              style={[
                expandingItemsAnimatedStyle,
                { 
                  left: parentWidth * 0.13, 
                  width: "48%",
                  height: "38%",
                  justifyContent: "flex-end"
                },
              ]}
            >
              <Text 
                className="text-[18px] font-Pixels text-[#fff7ff]"
                adjustsFontSizeToFit={true}
                numberOfLines={1}
              >
                {props.description}
              </Text>
            </Animated.View>
            <Animated.View
              className="absolute bottom-[10px] flex-row"
              style={[
                expandingItemsAnimatedStyle, 
                { 
                  flex: 1,
                  right: 6,
                  width: "36%",
                  height: "38%",
                  alignItems: "flex-end"
                }
              ]}
            >
              <Text 
                className="text-[18px] font-Pixels text-[#fff7ff] flex-1 text-right"
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {`Cost: ${shortMoneyString(props.cost)}`}
              </Text>
              <Canvas style={{ width: 13, height: 13, marginBottom: "3%" }}>
                <Image
                  image={getImage("shop.btc")}
                  fit="contain"
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  x={0}
                  y={0}
                  width={13}
                  height={13}
                />
              </Canvas>
            </Animated.View>
          </Pressable>

          {props.disableMinimize !== true && (
            <Animated.View
              style={[
                expandingItemsAnimatedStyle,
                {
                  zIndex: 101,
                  position: "absolute",
                  top: -5,
                  left: -5,
                  backgroundColor: "#8a1aef",
                  borderColor: "#33007e",
                  borderWidth: 2,
                  padding: 4,
                  borderRadius: 9999,
                },
              ]}
            >
              <Pressable
                hitSlop={8}
                onPress={() => {
                  setCollapseState(NotificationState.Collapsed);
                }}
              >
                <Feather name="minimize-2" size={12} color="white" />
              </Pressable>
            </Animated.View>
          )}
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
