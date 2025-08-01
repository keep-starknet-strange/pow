import React from "react";
import { View } from "react-native";
import { UnlockView } from "../store/UnlockView";
import { useStakingStore } from "../../stores/useStakingStore";
import { useTransactionsStore } from "../../stores/useTransactionsStore";

export type StakingUnlockProps = {
  alwaysShow?: boolean;
};

export const StakingUnlock: React.FC<StakingUnlockProps> = React.memo(
  (props) => {
    return (
      <View>
        <UnlockView
          icon={"logo.starknet"}
          label="Staking Locked"
          description="Purchase Libra to unlock."
          cost={0} // No cost since it's automatically unlocked when Libra is purchased
          onPress={() => {}}
        />
      </View>
    );
  },
);
