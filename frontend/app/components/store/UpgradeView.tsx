import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { IconWithLock } from "./transactionUpgrade/IconWithLock";
import { TxDetails } from "./transactionUpgrade/TxDetails";
import { UpgradeButton } from "./transactionUpgrade/UpgradeButton";

export type UpgradeViewProps = {
  chainId: number;
  upgrade: any; // TODO: define the type of upgrade
};

export const UpgradeView: React.FC<UpgradeViewProps> = React.memo((props) => {
  const { upgrades, getNextUpgradeCost, upgrade } = useUpgrades();

  const [level, setLevel] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(-1);
  useEffect(() => {
    const upgradeLevels = upgrades[props.chainId] || {};
    const upgradeLevel =
      upgradeLevels[props.upgrade.id] !== undefined
        ? upgradeLevels[props.upgrade.id]
        : -1;
    setCurrentLevel(upgradeLevel);
    setLevel(upgradeLevel + 1);
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
      case "Recursive Proving":
        return "shop.upgrades.recursiveProving";
      case "DA compression":
        return "shop.upgrades.daCompression";
      default:
        return "unknown";
    }
  };

  const [nextCost, setNextCost] = useState(0);
  useEffect(() => {
    setNextCost(getNextUpgradeCost(props.chainId, props.upgrade.id));
  }, [props.chainId, props.upgrade.id, getNextUpgradeCost, upgrades]);

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
          chainId={props.chainId}
          upgradeId={props.upgrade.id}
          currentLevel={currentLevel}
          values={props.upgrade.values}
          baseValue={props.upgrade.baseValue}
        />
      </View>
      <UpgradeButton
        label={`Purchase Upgrade`}
        level={level}
        maxLevel={props.upgrade.costs.length}
        nextCost={nextCost}
        onPress={() => {
          upgrade(props.chainId, props.upgrade.id);
        }}
        bgImage={"shop.auto.buy"}
      />
    </View>
  );
});
