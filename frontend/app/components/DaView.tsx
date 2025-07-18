import { useEffect, useState } from "react";
import { View } from "react-native";
import { useGame } from "../context/Game";
import { L2ProgressView } from "./L2ProgressView";
import { useUpgrades } from "../context/Upgrades";
import { DAConfirm } from "./DAConfirm";

export const DaView = () => {
  const { getDa } = useGame();
  const { getUpgradeValue } = useUpgrades();

  const [daWidth, setDaWidth] = useState(
    100 / (getUpgradeValue(1, "DA compression") || 1),
  );
  useEffect(() => {
    setDaWidth(getUpgradeValue(1, "DA compression") || 1);
  }, [getUpgradeValue]);

  return (
    <View>
      <L2ProgressView
        value={getDa()?.blocks.length || 0}
        maxValue={daWidth}
        label="Data Availability"
      />
      {getDa()?.isBuilt && (
        <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
          <DAConfirm />
        </View>
      )}
    </View>
  );
};
