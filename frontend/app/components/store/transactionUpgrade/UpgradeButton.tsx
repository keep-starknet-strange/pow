import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { PopupAnimation, PopupAnimationRef } from "../../PopupAnimation";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
  Path,
  Rect,
  RoundedRect,
} from "@shopify/react-native-skia";
import { useBalance } from "../../../stores/useBalanceStore";
import { useImages } from "../../../hooks/useImages";
import { useCachedWindowDimensions } from "../../../hooks/useCachedDimensions";
import { shortMoneyString } from "../../../utils/helpers";
import React from "react";
import Animated, {
  Easing,
  FadeInLeft,
  FadeInRight,
} from "react-native-reanimated";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import { useTransactionPause } from "../../../stores/useTransactionPauseStore";

type UpgradeButtonProps = {
  icon?: string;
  label: string;
  specialLabel?: {
    text: string;
    color: string;
  };
  level: number;
  maxLevel: number;
  nextCost: number;
  onPress: () => void;
  bgImage: string;
  // For pause functionality on speed upgrades
  chainId?: number;
  txId?: number;
  isDapp?: boolean;
  isSpeedUpgrade?: boolean;
};

export const UpgradeButton = memo<UpgradeButtonProps>(
  ({
    icon,
    label,
    specialLabel,
    level,
    maxLevel,
    nextCost,
    onPress,
    bgImage,
    chainId,
    txId,
    isDapp,
    isSpeedUpgrade,
  }) => {
    const { getImage } = useImages();
    const { width } = useCachedWindowDimensions();
    const { balance } = useBalance();
    const { isPaused, setPaused } = useTransactionPause();

    const popupRef = React.useRef<PopupAnimationRef>(null);

    const isMaxLevel = level === maxLevel;
    const showPauseButton =
      isMaxLevel &&
      isSpeedUpgrade &&
      chainId !== undefined &&
      txId !== undefined &&
      isDapp !== undefined;
    const paused = showPauseButton ? isPaused(chainId!, txId!, isDapp!) : false;

    const handlePauseToggle = () => {
      if (showPauseButton) {
        setPaused(chainId!, txId!, isDapp!, !paused);
      }
    };

    return (
      <Pressable
        onPress={() => {
          if (level < maxLevel) {
            onPress();
            const popupValue = `-${shortMoneyString(nextCost)}`;
            const popupColor = balance < nextCost ? "#CA1F4B" : "#F0E130";
            popupRef.current?.showPopup(popupValue, popupColor);
          }
        }}
        className="relative w-full"
        style={{
          width: width - 32,
          height: 36,
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage(bgImage)}
            fit="fill"
            x={0}
            y={0}
            width={width - 32}
            height={36}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.None,
            }}
          />
        </Canvas>
        <Animated.View
          className="absolute left-[6px] top-[6px] flex flex-row items-center gap-[4px]"
          entering={FadeInRight}
        >
          {icon && (
            <Canvas style={{ width: 18, height: 18 }}>
              <Image
                image={getImage(icon)}
                fit="contain"
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                x={0}
                y={0}
                width={18}
                height={18}
              />
            </Canvas>
          )}
          <Text className="font-Pixels text-xl text-[#fff7ff]">{label}</Text>
          {specialLabel && (
            <Text
              className="font-Pixels text-xl"
              style={{ color: specialLabel.color }}
            >
              {specialLabel.text}
            </Text>
          )}
        </Animated.View>
        {level === maxLevel ? (
          <Animated.View
            className="absolute right-[6px] top-[6px]"
            entering={FadeInLeft}
          >
            <View className="flex-row items-center gap-[8px]">
              <Text className="font-Pixels text-xl text-[#e7e7e7]">Max</Text>
              {showPauseButton && (
                <Pressable
                  onPress={handlePauseToggle}
                  className="justify-center items-center"
                  style={{ width: 24, height: 24 }}
                >
                  <Canvas style={{ width: 24, height: 24 }}>
                    {paused ? (
                      /* Play button - triangle */
                      <Path path="M 9 7 L 9 17 L 17 12 Z" color="#e7e7e7" />
                    ) : (
                      /* Pause button - two bars */
                      <>
                        <Rect
                          x={8}
                          y={7}
                          width={3}
                          height={10}
                          color="#e7e7e7"
                        />
                        <Rect
                          x={13}
                          y={7}
                          width={3}
                          height={10}
                          color="#e7e7e7"
                        />
                      </>
                    )}
                  </Canvas>
                </Pressable>
              )}
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            className="absolute right-[6px] top-[6px] flex-row items-center"
            entering={FadeInLeft}
          >
            <Text className="font-Pixels text-xl text-[#fff7ff]">
              Cost:&nbsp;
            </Text>
            <AnimatedRollingNumber
              value={nextCost}
              enableCompactNotation
              compactToFixed={2}
              textStyle={{
                color: "#fff7ff",
                fontFamily: "Pixels",
                fontSize: 16,
              }}
              spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
            />
            <PopupAnimation ref={popupRef} animRange={[0, -30]} />
            <Canvas style={{ width: 16, height: 16 }} className="">
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
        )}
      </Pressable>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the level or nextCost changes
    return (
      prevProps.level === nextProps.level &&
      prevProps.nextCost === nextProps.nextCost
    );
  },
);
