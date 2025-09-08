import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useL2Store } from "@/app/stores/useL2Store";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { FeatureUnlockView } from "../FeatureUnlockView";

export type L2UnlockProps = {
  alwaysShow?: boolean;
};

export const L2Unlock: React.FC<L2UnlockProps> = ({ alwaysShow }) => {
  const { canUnlockL2, getL2Cost, initL2 } = useL2Store();
  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[0];
  const [showUnlock, setShowUnlock] = useState(false);

  const canUnlockL2Value = canUnlockL2();

  useEffect(() => {
    if (alwaysShow) {
      setShowUnlock(true);
      return;
    }

    setShowUnlock(canUnlockL2Value);
  }, [alwaysShow, canUnlockL2Value]);

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
