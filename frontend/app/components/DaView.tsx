import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useGame } from "../context/Game";
import { useUpgrades } from "../context/Upgrades";
import { DAConfirm } from "./DAConfirm";

import feeImg from "../../assets/images/bitcoin.png";

export const DaView = () => {
  const { getDa } = useGame();
  const { getUpgradeValue } = useUpgrades();

  const [daWidth, setDaWidth] = useState(
    100 / (getUpgradeValue(1, "DA compression") || 1),
  );
  useEffect(() => {
    setDaWidth(100 / (getUpgradeValue(1, "DA compression") || 1));
  }, [getUpgradeValue]);

  return (
    <View
      className="flex flex-row items-center w-[13rem] h-[6rem]
                 bg-[#6060f710] rounded-lg shadow-lg relative
                 border-2 border-[#6060f7c0] overflow-hidden"
    >
      {getDa()?.blocks.map((da, index) => (
        <View
          className="flex flex-row h-full rounded-sm border-2 border-[#6060f7c0] bg-[#6060f710]"
          key={index}
          style={{ width: `${daWidth}%` }}
        >
          <Text className="text-white text-center text-xs font-bold">
            #{da}
          </Text>
        </View>
      ))}
      {getDa()?.isBuilt && (
        <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
          <DAConfirm />
        </View>
      )}
    </View>
  );
};
