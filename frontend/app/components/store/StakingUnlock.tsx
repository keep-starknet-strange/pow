import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useStaking } from "../../context/Staking";
import { UnlockView } from "./UnlockView";
import stakingConfig from "../../configs/staking.json";

export const StakingUnlock = () => {
  const { canUnlockStaking, unlockStaking, stakingUnlocked } = useStaking();
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    if (stakingUnlocked) {
      setShowUnlock(false);
      return;
    }
    if (!canUnlockStaking()) {
      setShowUnlock(false);
      return;
    }
    setShowUnlock(true);
  }, [canUnlockStaking, stakingUnlocked]);

  return (
    <View>
      {showUnlock && (
        <UnlockView
          icon={"nav.icon.staking.active"}
          label={"Unlock Staking"}
          description="Earn yield with POS!"
          cost={stakingConfig[0].unlockCosts[0]}
          onPress={() => unlockStaking(0)}
        />
      )}
    </View>
  );
};
