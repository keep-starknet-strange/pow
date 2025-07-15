import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { useGame } from "../../context/Game";
import { UnlockView } from "./UnlockView";

export type L2UnlockProps = {
  alwaysShow?: boolean;
};

export const L2Unlock: React.FC<L2UnlockProps> = ({ alwaysShow }) => {
  const { transactionFees, dappFees } = useTransactions();
  const { canUnlockL2, l2, getL2Cost, initL2 } = useGame();
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
    const txLevels = transactionFees[0];
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
    const dappLevels = dappFees[0];
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
    l2,
    transactionFees,
    dappFees,
  ]);

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
