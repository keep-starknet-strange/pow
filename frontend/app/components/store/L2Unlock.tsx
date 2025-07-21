import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useGameStore } from "@/app/stores/useGameStore";
import { UnlockView } from "./UnlockView";

export type L2UnlockProps = {
  alwaysShow?: boolean;
};

export const L2Unlock: React.FC<L2UnlockProps> = ({ alwaysShow }) => {
  const { transactionFeeLevels, dappFeeLevels } = useTransactionsStore();
  const { canUnlockL2, l2, getL2Cost, initL2 } = useGameStore();
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    if (alwaysShow) {
      setShowUnlock(true);
      return;
    }

    if (l2) {
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
  }, [alwaysShow, canUnlockL2, l2, transactionFeeLevels, dappFeeLevels]);

  return (
    <View>
      {showUnlock && (
        <UnlockView
          icon={"logo.starknet"}
          label="Unlock L2"
          description="New phase of scaling!"
          cost={getL2Cost()}
          onPress={() => {
            initL2();
          }}
        />
      )}
    </View>
  );
};
