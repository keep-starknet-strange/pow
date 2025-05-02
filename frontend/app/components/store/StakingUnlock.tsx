import { View } from "react-native";
import { useStaking } from "../../context/Staking";
import { UnlockView } from "./UnlockView";
import stakingConfig from "../../configs/staking.json";
import dappsIcon from "../../../assets/images/transaction/dapp.png";

export const StakingUnlock = () => {
  const {unlockStaking, stakingPools } = useStaking();
  const nextIdx = stakingPools.length;
  const nextCfg = stakingConfig[nextIdx];

  if (!nextCfg) return null;

  const { name, icon, unlockCosts } = nextCfg;

  return (
    <View>
      {nextCfg && (
        <UnlockView icon={dappsIcon} name={"Staking on " + name}  description="Earn yield with POS!" cost={unlockCosts[0]} onPress={() => unlockStaking(nextIdx)} />
      )}
    </View>
  );
}
