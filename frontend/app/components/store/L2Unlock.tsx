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
  const { canUnlockL2, isL2Unlocked, getL2Cost, initL2 } = useL2Store();
  const { transactionFeeLevels, dappFeeLevels } = useTransactionsStore();
  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[0];
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    if (alwaysShow) {
      setShowUnlock(true);
      return;
    }

    if (miningBlock?.isBuilt) {
      setShowUnlock(false);
      return;
    }

    const canUnlock = canUnlockL2();

    setShowUnlock(canUnlock);
  }, [
    alwaysShow,
    canUnlockL2,
    miningBlock?.isBuilt,
  ]);

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
        />
      )}
    </View>
  );
};
