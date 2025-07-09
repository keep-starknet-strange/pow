import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useUpgrades } from "../../context/Upgrades";
import { useBalance } from "../../stores/useBalanceStore";
import { shortMoneyString } from "../../utils/helpers";
import { IconWithLock } from "./transactionUpgrade/IconWithLock";
import { TxDetails } from "./transactionUpgrade/TxDetails";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import Animated, { Easing, FadeInLeft, FadeInRight } from "react-native-reanimated";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import { PopupAnimation } from "../PopupAnimation";
import { useImageProvider } from "../../context/ImageProvider";

export type UpgradeViewProps = {
  chainId: number;
  upgrade: any; // TODO: define the type of upgrade
};

export const UpgradeView: React.FC<UpgradeViewProps> = (props) => {
  const { getImage } = useImageProvider();
  const { balance } = useBalance();
  const { width } = Dimensions.get("window");
  const { upgrades, getNextUpgradeCost, upgrade } = useUpgrades();
  const [lastBuyTime, setLastBuyTime] = React.useState<number>(0);

  const [level, setLevel] = useState(0);
  useEffect(() => {
    setLevel(upgrades[props.chainId][props.upgrade.id] + 1 || 0);
  }, [props.chainId, props.upgrade, upgrades]);

  const getUpgradeIcon = (chainId: number, upgradeName: string) => {
    switch (upgradeName) {
      case "Block Difficulty":
        return "shop.upgrades.blockDifficulty";
      case "Block Reward":
        return "shop.upgrades.blockReward";
      case "Block Size":
        return "shop.upgrades.blockSize";
      case "MEV Boost":
        return "shop.upgrades.mevBoost";
      default:
        return "unknown";
    }
  };

  const [nextCost, setNextCost] = useState(0);
  useEffect(() => {
    setNextCost(getNextUpgradeCost(props.chainId, props.upgrade.id));
  }, [props.chainId, props.upgrade.id, getNextUpgradeCost]);

  return (
    <View className="flex flex-col w-full">
      <View className="flex flex-row w-full mb-[4px]">
        <IconWithLock
          txIcon={getUpgradeIcon(props.chainId, props.upgrade.name)}
          locked={false}
        />
        <TxDetails
          name={props.upgrade.name}
          description={props.upgrade.description}
        />
      </View>
      <TouchableOpacity
        className="relative w-full"
        style={{
          width: width - 32,
          height: 36,
        }}
        onPress={() => {
          upgrade(props.chainId, props.upgrade.id);
          setLastBuyTime(Date.now());
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("shop.auto.buy")}
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
          Purchase Upgrade
        </Animated.Text>
        {level === props.upgrade.costs.length ? (
          <Animated.Text className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#ff0000]" entering={FadeInLeft} >
            Max
          </Animated.Text>
        ) : (
          <Animated.Text className="absolute right-[8px] top-[6px] flex-row items-center gap-1" entering={FadeInLeft} >
            <Text className="font-Pixels text-xl text-[#fff7ff]">
              Cost:&nbsp;
            </Text>
            <AnimatedRollingNumber
              value={nextCost}
              enableCompactNotation
              compactToFixed={2}
              textStyle={{ color: "#e7e7e7", fontFamily: "Pixels", fontSize: 16 }}
              spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
            />
          </Animated.Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
