import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { useStaking } from "../../context/Staking";
import { UnlockView } from "./UnlockView";
import dappsIcon from "../../../assets/images/transaction/dapp.png";

export const StakingUnlock = () => {
  const { stakingUnlocked, unlockStaking, getStakingUnlockCost } = useStaking();
  const { transactionFees } = useTransactions();
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    if (stakingUnlocked) {
      setShowUnlock(false);
      return;
    }
    setShowUnlock(true);
  }, [stakingUnlocked, transactionFees]);

  return (
    <View>
      {showUnlock && (
        <UnlockView icon={dappsIcon} name="Staking" description="Earn yield with POS!" cost={getStakingUnlockCost()} onPress={unlockStaking} />
      )}
    </View>
  );
}

