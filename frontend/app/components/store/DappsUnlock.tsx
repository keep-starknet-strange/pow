import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { UnlockView } from "./UnlockView";
import dappsIcon from "../../../assets/images/transaction/dapp.png";

export type DappsUnlockProps = {
  chainId: number;
};

export const DappsUnlock: React.FC<DappsUnlockProps> = (props) => {
  const { dappsUnlocked, unlockDapps, getDappUnlockCost, transactionFees } =
    useTransactions();
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    if (dappsUnlocked[props.chainId]) {
      setShowUnlock(false);
      return;
    }
    const txLevels = transactionFees[props.chainId];
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
    setShowUnlock(true);
  }, [dappsUnlocked, props.chainId, transactionFees]);

  return (
    <View>
      {showUnlock && (
        <UnlockView
          icon={dappsIcon}
          name="Dapps"
          description="Get access to Dapps"
          cost={getDappUnlockCost(props.chainId)}
          onPress={() => unlockDapps(props.chainId)}
          style={{ marginTop: 26, marginBottom: 0 }}
        />
      )}
    </View>
  );
};
