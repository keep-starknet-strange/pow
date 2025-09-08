import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { FeatureUnlockView } from "../FeatureUnlockView";
import { useGameStore } from "@/app/stores/useGameStore";

export type PrestigeUnlockProps = {
  disableMinimize?: boolean;
  marginHorizontal?: number;
};

export const PrestigeUnlock: React.FC<PrestigeUnlockProps> = (props) => {
  const { prestige, getNextPrestigeCost, canPrestige, currentPrestige } =
    useUpgrades();
  const [showUnlock, setShowUnlock] = useState(false);
  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[1];

  /*
  TODO
  useEffect(() => {
    setShowUnlock(canPrestige);
  }, [canPrestige]);
  */

  return (
    <View>
      {showUnlock && (
        <FeatureUnlockView
          label="Prestige"
          description="Reset and build bigger!"
          cost={getNextPrestigeCost()}
          onPress={() => prestige()}
          hidden={miningBlock?.isBuilt}
          disableMinimize={props.disableMinimize}
          marginHorizontal={props.marginHorizontal}
        />
      )}
    </View>
  );
};
