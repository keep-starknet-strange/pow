import { useEffect, useState } from "react";
import { View } from "react-native";
import { L2ProgressView } from "./L2ProgressView";
import { useGameStore } from "@/app/stores/useGameStore";
import { useUpgrades } from "../context/Upgrades";
import { Prover } from "./Prover";

export const ProverView = () => {
  const { getProver } = useGameStore();
  const { getUpgradeValue } = useUpgrades();

  const [proofMaxSize, setProofMaxSize] = useState(
    getUpgradeValue(1, "Recursive Proving") || 1,
  );
  useEffect(() => {
    const upgradeValue = getUpgradeValue(1, "Recursive Proving");
    if (upgradeValue) {
      setProofMaxSize(upgradeValue);
    }
  }, [getUpgradeValue]);

  return (
    <View>
      <L2ProgressView
        value={getProver()?.blocks.length || 0}
        maxValue={proofMaxSize}
        fees={getProver()?.blockFees || 0}
        label="Proving"
      />
      {getProver()?.isBuilt && (
        <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
          <Prover />
        </View>
      )}
    </View>
  );
};
