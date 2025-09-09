import React from "react";
import { View } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useL2Store } from "@/app/stores/useL2Store";
import { FeatureUnlockView } from "../FeatureUnlockView";

export type L2UnlockProps = {
  alwaysShow?: boolean;
};

export const L2Unlock: React.FC<L2UnlockProps> = ({ alwaysShow }) => {
  const { canUnlockL2, getL2Cost, initL2, isL2Unlocked } = useL2Store();
  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[0];
  const showUnlock = alwaysShow ? true : !isL2Unlocked && canUnlockL2();

  return (
    <View>
      {showUnlock && (
        <FeatureUnlockView
          label="Unlock L2"
          description="Boundless scaling!"
          cost={getL2Cost()}
          onPress={() => {
            initL2();
          }}
          hidden={miningBlock?.isBuilt}
        />
      )}
    </View>
  );
};
