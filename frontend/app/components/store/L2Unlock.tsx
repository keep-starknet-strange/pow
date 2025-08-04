import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useGameStore } from "@/app/stores/useGameStore";
import { useL2Store } from "@/app/stores/useL2Store";
import { FeatureUnlockView } from "../FeatureUnlockView";
import { useShallow } from "zustand/react/shallow";

export type L2UnlockProps = {
  alwaysShow?: boolean;
};

export const L2Unlock: React.FC<L2UnlockProps> = ({ alwaysShow }) => {
  const { transactionFeeLevels, dappFeeLevels } = useTransactionsStore();
  const { canUnlockL2, isL2Unlocked, getL2Cost, initL2 } = useL2Store();
  // Shallow state management: only re-render when mining block (index 0) changes
  const miningBlock = useGameStore(
    useShallow((state) => state.workingBlocks[0]),
  );
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

    if (isL2Unlocked) {
      setShowUnlock(false);
      return;
    }

    if (!canUnlockL2) {
      setShowUnlock(false);
      return;
    }

    // Ensure all L1 transactions unlocked
    const txLevels = transactionFeeLevels[0];
    if (!txLevels) {
      setShowUnlock(false);
      return;
    }
    for (const level of Object.values(txLevels)) {
      if (level === -1) {
        setShowUnlock(false);
        return;
      }
    }

    // Ensure all L1 dapps unlocked
    const dappLevels = dappFeeLevels[0];
    if (!dappLevels) {
      setShowUnlock(false);
      return;
    }
    for (const level of Object.values(dappLevels)) {
      if (level === -1) {
        setShowUnlock(false);
        return;
      }
    }
    setShowUnlock(true);
  }, [
    alwaysShow,
    canUnlockL2,
    isL2Unlocked,
    transactionFeeLevels,
    dappFeeLevels,
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
