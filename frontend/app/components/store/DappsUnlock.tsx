import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { UnlockView } from "./UnlockView";

export type DappsUnlockProps = {
  chainId: number;
};

export const DappsUnlock: React.FC<DappsUnlockProps> = (props) => {
  const { canUnlockDapps, dappsUnlocked, unlockDapps, getDappUnlockCost } =
    useTransactionsStore();
  const showUnlock = !dappsUnlocked[props.chainId] && canUnlockDapps(props.chainId);

  return (
    <View>
      {showUnlock && (
        <UnlockView
          icon={
            props.chainId === 0
              ? "achievements.l1.dapps"
              : "achievements.l2.dapps"
          }
          label="Unlock dApps"
          description="Attract users with Apps!"
          cost={getDappUnlockCost(props.chainId)}
          onPress={() => unlockDapps(props.chainId)}
        />
      )}
    </View>
  );
};
