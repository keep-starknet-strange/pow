import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useBalance } from "../context/Balance";
import { useStaking } from "../context/Staking";
import { useTicker } from "../hooks/useTicker";
import { useVisibleBlocks } from "../hooks/useVisibleBlocks";
import StakingChain from "./stakingPage/StakingChain";
import { AlertModal } from "../components/AlertModal";
import stakingConfig from "../configs/staking.json";

const SECOND = 1000;

export const StakingPage: React.FC = (props) => {
  const { balance } = useBalance();
  const { stakingPools, stakeTokens, claimRewards, accrueAll } = useStaking();
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const tick = useTicker(SECOND);

  useEffect(() => {
    accrueAll();
  }, [tick, accrueAll]);

  interface StakeParams {
    id: number;
    stakingAmount: number;
  }
  const onPressStake = (id: StakeParams['id'], stakingAmount: StakeParams['stakingAmount']): void => {
    const amt: number = stakingAmount;
    if (amt > balance) {
      setInsufficientFunds(true);
    } else {
      stakeTokens(id, amt);
    }
  };
  return (
    <View className="flex-1 bg-gray-900 px-4 py-6">
      <View className="flex flex-row justify-end items-center p-2">
        <Text className="text-[#e7e7e7] text-4xl font-bold mr-2">🥩Staking</Text>
      </View>
      {stakingPools?.map((stakingPool, idx) => {
        const meta = stakingConfig[idx];
        const [visibleBlocks, blocksShown] = useVisibleBlocks(stakingPool.createdAt, tick, 4);
        return (
          <StakingChain
          key={idx}
          idx={idx}
          meta={meta}
          visibleBlocks={visibleBlocks}
          blocksShown={blocksShown}
          stakingPool={stakingPool}
          claimRewards={claimRewards}
          onPressStake={onPressStake}
        /> 
        )
      })}

    <AlertModal
      visible={insufficientFunds}
      title="Insufficient Funds"
      onClose={() => setInsufficientFunds(false)}
    />
  </View>
  )
}
