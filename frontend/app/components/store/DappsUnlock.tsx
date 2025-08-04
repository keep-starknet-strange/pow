import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useGameStore } from "@/app/stores/useGameStore";
import { FeatureUnlockView } from "../FeatureUnlockView";
import { useShallow } from "zustand/react/shallow";

export type DappsUnlockProps = {
  chainId: number;
};

export const DappsUnlock: React.FC<DappsUnlockProps> = (props) => {
  const { canUnlockDapps, dappsUnlocked, unlockDapps, getDappUnlockCost } =
    useTransactionsStore();
  // Shallow state management: only re-render when this specific chainId's block changes
  const currentWorkingBlock = useGameStore(
    useShallow((state) => state.workingBlocks[props.chainId]),
  );
  const showUnlock =
    !dappsUnlocked[props.chainId] &&
    canUnlockDapps(props.chainId) &&
    !currentWorkingBlock.isBuilt;

  return (
    <View>
      {showUnlock && (
        <FeatureUnlockView
          label="Unlock dApps"
          description="Build an Ecosystem!"
          cost={getDappUnlockCost(props.chainId)}
          onPress={() => unlockDapps(props.chainId)}
        />
      )}
    </View>
  );
};
