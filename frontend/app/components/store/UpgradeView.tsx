import React, {useEffect, useState} from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import moneyImg from "../../../assets/images/money.png";
import { useUpgrades } from "../../context/Upgrades";
import { getUpgradeIcons } from "../../utils/upgrades";

export type UpgradeViewProps = {
  chainId: number;
  upgrade: any; // TODO: define the type of upgrade
}

export const UpgradeView: React.FC<UpgradeViewProps> = (props) => {
  const { upgrades, getNextUpgradeCost, upgrade } = useUpgrades();

  const [level, setLevel] = useState(0);
  const [upgradeIcon, setUpgradeIcon] = useState(getUpgradeIcons(props.chainId)[props.upgrade.name]);
  useEffect(() => {
    setLevel(upgrades[props.chainId][props.upgrade.id] + 1 || 0);
    setUpgradeIcon(getUpgradeIcons(props.chainId)[props.upgrade.name]);
  }, [props.chainId, props.upgrade, upgrades]);

  return (
    <View className="flex flex-row w-full items-center">
      <View className="flex flex-col justify-center items-center p-1
                       rounded-full border-2 border-[#e7e7e740] relative"
            style={{backgroundColor: props.upgrade.color}}
      >
        <Image source={upgradeIcon} className="w-[3.6rem] h-[3.6rem] rounded-full" />
        <Text
          className="absolute bottom-[-0.5rem] text-center px-1 w-[3.6rem]
                     border-2 border-[#e7e7e740] rounded-xl
                    text-[#171717] text-sm font-bold"
          style={{backgroundColor: props.upgrade.color.substring(0, 7) + "f0"}}
        >
          {level}/{props.upgrade.costs.length}
        </Text>
      </View>
      <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
        <Text className="text-[#e7e7e7] text-xl font-bold">{props.upgrade.name}</Text>
        <Text className="text-[#e7e7e7] text-md">{props.upgrade.description}</Text>
      </View>
      <TouchableOpacity
        className="flex justify-center items-center bg-[#e7e7e730]
                   rounded-lg p-2 relative border-2 border-[#e7e7e740]"
        onPress={() => {
          upgrade(props.chainId, props.upgrade.id);
        }}
      >
        <Image source={moneyImg} className="w-[3rem] h-[3rem]" />
        <Text
          className="absolute top-[-1rem] text-center px-1 w-[3.6rem]
                     border-2 border-[#e7e7e740] rounded-xl
                     text-[#171717] text-sm font-bold bg-[#e7e760f0]"
        >
          {level === props.upgrade.costs.length ? "MAX" : `₿${getNextUpgradeCost(props.chainId, props.upgrade.id)}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
