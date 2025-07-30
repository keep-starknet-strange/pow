import { memo } from "react";
import { Dimensions, Pressable, Text } from "react-native";
import { PopupAnimation } from "../../PopupAnimation";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useBalance } from "../../../stores/useBalanceStore";
import { useImages } from "../../../hooks/useImages";

import Animated, {
  Easing,
  FadeInLeft,
  FadeInRight,
} from "react-native-reanimated";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";

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
  }) => {
    const { getImage } = useImages();
    const { width } = Dimensions.get("window");
    const { balance } = useBalance();

    const [lastBuyTime, setLastBuyTime] = React.useState<number>(0);

    return (
      <Pressable
        onPress={() => {
          if (level < maxLevel) {
            onPress();
            setLastBuyTime(Date.now());
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
          className="absolute left-[8px] top-[6px] flex flex-row items-center gap-[4px]"
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
          <Animated.Text
            className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#e7e7e7]"
            entering={FadeInLeft}
          >
            Max
          </Animated.Text>
        ) : (
          <Animated.View
            className="absolute right-[8px] top-[6px] flex-row items-center"
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
            <PopupAnimation
              popupStartTime={lastBuyTime}
              popupValue={`-${nextCost}`}
              animRange={[0, -30]}
              color={balance < nextCost ? "#CA1F4B" : "#F0E130"}
            />
            <Canvas style={{ width: 16, height: 16 }} className="mr-1">
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
