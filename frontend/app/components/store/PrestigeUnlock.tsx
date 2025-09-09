import React from "react";
import { View } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { FeatureUnlockView } from "../FeatureUnlockView";
import { useGameStore } from "@/app/stores/useGameStore";

export type PrestigeUnlockProps = {
  disableMinimize?: boolean;
  marginHorizontal?: number;
};

export const PrestigeUnlock: React.FC<PrestigeUnlockProps> = (props) => {
  const { prestige, getNextPrestigeCost, canPrestige } =
    useUpgrades();
  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[1];

  return (
    <View>
      {canPrestige && (
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
