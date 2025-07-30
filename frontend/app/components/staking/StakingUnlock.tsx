import React from "react";
import { View } from "react-native";
import { UnlockView } from "../store/UnlockView";
import { useStakingStore } from "../../stores/useStakingStore";
import { useTransactionsStore } from "../../stores/useTransactionsStore";

export type StakingUnlockProps = {
  alwaysShow?: boolean;
};

export const StakingUnlock: React.FC<StakingUnlockProps> = React.memo(
  ({ alwaysShow = false }) => {
    const { stakingUnlocked, unlockStaking } = useStakingStore();
    const { dappFeeLevels } = useTransactionsStore();

    // Check if Libra dapp (id: 3) is unlocked on L1 (chainId: 0)
    const l1DappLevels = dappFeeLevels[0];
    const isLibraUnlocked =
      l1DappLevels?.[3] !== undefined && l1DappLevels[3] >= 0;

    const shouldShow = alwaysShow || (!stakingUnlocked && isLibraUnlocked);

    if (!shouldShow) {
      return null;
    }

    return (
      <View>
        <UnlockView
          icon={"logo.starknet"}
          label="Unlock Staking"
          description="Participate in governance with Libra protocol"
          cost={0} // No cost since it's automatically unlocked when Libra is purchased
          onPress={unlockStaking}
          disabled={stakingUnlocked}
        />
      </View>
    );
  },
);
