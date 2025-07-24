import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useGameStore } from "@/app/stores/useGameStore";
import { UnlockView } from "../store/UnlockView";

export type StakingUnlockProps = {
  alwaysShow?: boolean;
};

export const StakingUnlock: React.FC<StakingUnlockProps> = ({ alwaysShow }) => {

  return (
    <View>
      <UnlockView
        icon={"logo.starknet"}
        label="Unlock Staking"
        description="Lock up your assets to earn rewards and participate in governance."
        cost={42069}
        onPress={() => {
          console.log("med rare steak");
        }}
      />
    </View>
  );
};
