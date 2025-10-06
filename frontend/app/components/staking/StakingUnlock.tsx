import React from "react";
import { View } from "react-native";
import { FeatureUnlockView } from "../FeatureUnlockView";
import { useStakingStore } from "../../stores/useStakingStore";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useGameStore } from "../../stores/useGameStore";

export type StakingUnlockProps = {
  alwaysShow?: boolean;
  hidden?: boolean;
};

export const StakingUnlock: React.FC<StakingUnlockProps> = React.memo(
  (props) => {
    const { isUnlocked, getUnlockCost, unlockStaking } = useStakingStore();
    // Select a derived boolean from TransactionsStore so this component re-renders
    // the moment dapp id 2 (Paave) becomes unlocked on L1.
    const availableToPurchase = useTransactionsStore((s) =>
      s.canUnlockStaking(0),
    );
    const { workingBlocks } = useGameStore();
    const miningBlock = workingBlocks[0];
    const showUnlock = props.alwaysShow ? true : !isUnlocked && availableToPurchase;
    const description = availableToPurchase
      ? "Stake BTC to earn rewards!"
      : "Unlock Paave to unlock staking";

    return (
      <View>
        {showUnlock && (
          <FeatureUnlockView
            label="Unlock Staking"
            description={description}
            cost={getUnlockCost()}
            onPress={() => {
              if (!availableToPurchase) return;
              unlockStaking();
            }}
            hidden={
              props.hidden !== undefined ? props.hidden : miningBlock?.isBuilt
            }
            disabled={!availableToPurchase}
          />
        )}
      </View>
    );
  },
);