import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { shortMoneyString } from "../../utils/helpers";
import { IconWithLock } from "./transactionUpgrade/IconWithLock";
import { TxDetails } from "./transactionUpgrade/TxDetails";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

export type UpgradeViewProps = {
  chainId: number;
  upgrade: any; // TODO: define the type of upgrade
};

export const UpgradeView: React.FC<UpgradeViewProps> = (props) => {
  const { getImage } = useImages();
  const { width } = Dimensions.get("window");
  const { upgrades, getNextUpgradeCost, upgrade } = useUpgrades();

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
        className="relative"
        style={{
          width: width - 32,
          height: 36,
        }}
        onPress={() => {
          upgrade(props.chainId, props.upgrade.id);
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
        <Text className="absolute left-[8px] top-[6px] font-Pixels text-xl text-[#fff7ff]">
          Purchase Upgrade
        </Text>
        {level === props.upgrade.costs.length ? (
          <Text className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#ff0000]">
            Max
          </Text>
        ) : (
          <Text className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#fff7ff]">
            Cost:{" "}
            {shortMoneyString(
              getNextUpgradeCost(props.chainId, props.upgrade.id),
            )}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
