import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useL2Store } from "@/app/stores/useL2Store";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { FeatureUnlockView } from "../FeatureUnlockView";
import { useShallow } from "zustand/react/shallow";

export type L2UnlockProps = {
  alwaysShow?: boolean;
};

export const L2Unlock: React.FC<L2UnlockProps> = ({ alwaysShow }) => {
  const { canUnlockL2, isL2Unlocked, getL2Cost, initL2 } = useL2Store();
  // Subscribe to transaction and dapp levels to trigger re-renders when they change
  const { transactionFeeLevels, dappFeeLevels } = useTransactionsStore(
    useShallow((state) => ({
      transactionFeeLevels: state.transactionFeeLevels[0],
      dappFeeLevels: state.dappFeeLevels[0],
    })),
  );
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

    // Use centralized canUnlockL2 function which includes isL2Unlocked check
    const canUnlock = canUnlockL2();

    // Only hide for built mining block if we can't unlock L2
    if (miningBlock?.isBuilt && !canUnlock) {
      setShowUnlock(false);
      return;
    }

    setShowUnlock(canUnlock);
  }, [
    alwaysShow,
    canUnlockL2,
    miningBlock?.isBuilt,
    transactionFeeLevels,
    dappFeeLevels,
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
