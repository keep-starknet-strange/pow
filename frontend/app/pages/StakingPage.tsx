import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useGameState } from "../context/GameState";
import { useStaking } from "../hooks/useStaking";
import { useTicker } from "../hooks/useTicker";
import { useVisibleBlocks } from "../hooks/useVisibleBlocks";
import StakingChain from "./stakingPage/StakingChain";
import { AlertModal } from "../components/AlertModal";
import stakingConfig from "../configs/staking.json";

const SECOND = 1000;

export type StakingPageProps = {
  switchPage: (page: string) => void;
};

export const StakingPage: React.FC = (props) => {
  const { gameState } = useGameState();
  const { stakeTokens, claimRewards, accrueAll } = useStaking();
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const tick = useTicker(SECOND);
  const pools = gameState.stakingPools?.map((pool) => {
    useVisibleBlocks(pool.createdAt ?? 0, SECOND, 4);
  });

  useFocusEffect(
    React.useCallback(() => {
      accrueAll();         
    }, [accrueAll])
  );

  useEffect(() => {
    accrueAll();
  }, [tick, accrueAll]);

  interface StakeParams {
    id: number;
    stakingAmount: number;
  }
  const onPressStake = (id: StakeParams['id'], stakingAmount: StakeParams['stakingAmount']): void => {
    const amt: number = stakingAmount;
    if (amt > gameState.balance) {
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

      {gameState.stakingPools?.map((pool, idx) => {
        const meta = stakingConfig[idx];
        const [visibleBlocks, blocksShown] = useVisibleBlocks(pool.createdAt, tick, 4);
        return (
          <StakingChain
          key={idx}
          idx={idx}
          meta={meta}
          visibleBlocks={visibleBlocks}
          blocksShown={blocksShown}
          stakingPool={pool}
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
