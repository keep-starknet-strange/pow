import { Dimensions, TouchableOpacity, Text } from "react-native";
import { PopupAnimation } from "../../PopupAnimation";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useBalance } from "../../../stores/useBalanceStore";
import { useImages } from "../../../hooks/useImages";
import React from "react";
import Animated, {
  Easing,
  FadeInLeft,
  FadeInRight,
} from "react-native-reanimated";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";

type UpgradeButtonProps = {
  icon?: any;
  label: string;
  level: number;
  maxLevel: number;
  nextCost: number;
  onPress: () => void;
  bgImage: string;
};

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  icon,
  label,
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
    <TouchableOpacity
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
      <Animated.Text className="absolute left-[8px] top-[6px] font-Pixels text-xl text-[#fff7ff]" entering={FadeInRight} >
        {label}
      </Animated.Text>
      {level === maxLevel ? (
        <Animated.Text className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#e7e7e7]" entering={FadeInLeft} >
          Max
        </Animated.Text>
      ) : (
        <Animated.View className="absolute right-[8px] top-[6px] flex-row items-center gap-1" entering={FadeInLeft}>
          <Text className="font-Pixels text-xl text-[#fff7ff]">
            Cost:&nbsp;
          </Text>
          <AnimatedRollingNumber
            value={nextCost}
            enableCompactNotation
            compactToFixed={2}
            textStyle={{ color: "#fff7ff", fontFamily: "Pixels", fontSize: 16 }}
            spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
          />
          <PopupAnimation
            popupStartTime={lastBuyTime}
            popupValue={`-${nextCost}`}
            animRange={[0, -30]}
            color={balance < nextCost ? "#CA1F4B" : "#F0E130"}
          />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};
