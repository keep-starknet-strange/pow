import React, { useState, useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import { useBalance } from "../stores/useBalanceStore";
import { useStaking } from "../context/Staking";
import { useTicker } from "../hooks/useTicker";
import { useVisibleBlocks } from "../hooks/useVisibleBlocks";
import StakingChain from "./stakingPage/StakingChain";
import { AlertModal } from "../components/AlertModal";
import { StakingUnlock } from "../components/store/StakingUnlock";
import stakingConfig from "../configs/staking.json";

const SECOND = 1000;

export const StakingPage: React.FC = (props) => {
  const { balance } = useBalance();
  const { stakingPools, stakeTokens, claimRewards, accrueAll } = useStaking();
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const tick = useTicker(SECOND);
  const windowSize = 4;
  const pools = stakingPools.map((stakingPool, idx) => {
    const meta = stakingConfig[idx];
    return { meta, stakingPool, idx };
  });

  useEffect(() => {
    accrueAll();
  }, [tick, accrueAll]);

  interface StakeParams {
    id: number;
    stakingAmount: number;
  }
  const onPressStake = (
    id: StakeParams["id"],
    stakingAmount: StakeParams["stakingAmount"],
  ): void => {
    const amt: number = stakingAmount;
    if (amt > balance) {
      setInsufficientFunds(true);
    } else {
      stakeTokens(id, amt);
    }
  };
  return (
    <ScrollView
      className="flex-1 bg-gray-900 px-4 py-6"
      contentContainerClassName="pb-24"
    >
      <View className="flex flex-row justify-end items-center p-2">
        <Text className="text-[#e7e7e7] text-4xl font-bold mr-2">
          🥩Staking
        </Text>
      </View>
      {pools?.map((props, idx) => {
        return (
          <StakingChain
            key={props.meta.name}
            idx={idx}
            tick={tick}
            meta={props.meta}
            windowSize={windowSize}
            stakingPool={props.stakingPool}
            claimRewards={claimRewards}
            onPressStake={onPressStake}
          />
        );
      })}

      <StakingUnlock />

      <AlertModal
        visible={insufficientFunds}
        title="Insufficient Funds"
        onClose={() => setInsufficientFunds(false)}
      />
    </ScrollView>
  );
};
