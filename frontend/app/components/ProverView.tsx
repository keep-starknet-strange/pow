import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useGame } from "../context/Game";
import { useUpgrades } from "../context/Upgrades";
import { Prover } from "./Prover";

export const ProverView = () => {
  const { getProver } = useGame();
  const { getUpgradeValue } = useUpgrades();

  const [blockWidth, setBlockWidth] = useState(
    100 / (getUpgradeValue(1, "Recursive Proving") || 1),
  );
  useEffect(() => {
    const maxSize = getUpgradeValue(1, "Recursive Proving");
    setBlockWidth(100 / (maxSize || 1));
  }, [getUpgradeValue]);

  return (
    <View
      className="flex flex-row items-center w-[13rem] h-[6rem]
                 bg-[#f760f710] rounded-lg shadow-lg relative
                 border-2 border-[#f760f7c0] overflow-hidden"
    >
      {getProver()?.blocks.map((block, index) => (
        <View
          className="flex flex-row rounded-sm border-2 border-[#f760f7c0] bg-[#60606010] shadow-sm"
          key={index}
          style={{ width: `${blockWidth}%`, height: `${blockWidth}%` }}
        >
          <Text className="text-white text-center text-xs font-bold">
            #{block}
          </Text>
        </View>
      ))}
      {getProver()?.isBuilt && (
        <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
          <Prover />
        </View>
      )}
    </View>
  );
};
