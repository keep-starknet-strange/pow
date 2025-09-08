import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useGameStore } from "@/app/stores/useGameStore";
import { FeatureUnlockView } from "../FeatureUnlockView";

export type DappsUnlockProps = {
  chainId: number;
};

export const DappsUnlock: React.FC<DappsUnlockProps> = (props) => {
  const { canUnlockDapps, dappsUnlocked, unlockDapps, getDappUnlockCost } =
    useTransactionsStore();
  const { workingBlocks } = useGameStore();
  const currentWorkingBlock = workingBlocks[props.chainId];
  const showUnlock =
    !dappsUnlocked[props.chainId] && canUnlockDapps(props.chainId);

  return (
    <View>
      {showUnlock && (
        <FeatureUnlockView
          label="Unlock dApps"
          description="Build an Ecosystem!"
          cost={getDappUnlockCost(props.chainId)}
          onPress={() => unlockDapps(props.chainId)}
          hidden={currentWorkingBlock.isBuilt}
        />
      )}
    </View>
  );
};
