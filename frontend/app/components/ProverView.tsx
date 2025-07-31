import { useEffect, useState } from "react";
import { View } from "react-native";
import { L2ProgressView } from "./L2ProgressView";
import { useL2Store } from "@/app/stores/useL2Store";
import { useUpgrades } from "../stores/useUpgradesStore";
import { Prover } from "./Prover";

export const ProverView = () => {
  const { getProver } = useL2Store();
  const { getUpgradeValue, upgrades } = useUpgrades();

  const [proofMaxSize, setProofMaxSize] = useState(
    getUpgradeValue(1, "Recursive Proving") || 1,
  );
  
  useEffect(() => {
    const upgradeValue = getUpgradeValue(1, "Recursive Proving") || 1;
    setProofMaxSize(upgradeValue);
  }, [upgrades, getUpgradeValue]); // Now depends on upgrades state

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
