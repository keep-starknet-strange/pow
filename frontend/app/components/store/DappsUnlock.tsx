import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { UnlockView } from "./UnlockView";

export type DappsUnlockProps = {
  chainId: number;
};

export const DappsUnlock: React.FC<DappsUnlockProps> = (props) => {
  const { canUnlockDapps, dappsUnlocked, unlockDapps, getDappUnlockCost } =
    useTransactions();
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    if (dappsUnlocked[props.chainId]) {
      setShowUnlock(false);
      return;
    }
    if (!canUnlockDapps(props.chainId)) {
      setShowUnlock(false);
      return;
    }
    setShowUnlock(true);
  }, [props.chainId, canUnlockDapps, dappsUnlocked]);

  return (
    <View>
      {showUnlock && (
        <UnlockView
          icon={props.chainId === 0 ? "achievements.l1.dapps" : "achievements.l2.dapps"}
          label="Unlock dApps"
          description="Attract users with Apps!"
          cost={getDappUnlockCost(props.chainId)}
          onPress={() => unlockDapps(props.chainId)}
        />
      )}
    </View>
  );
};
