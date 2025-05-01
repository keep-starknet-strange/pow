import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
<<<<<<< HEAD
import { useBalance } from "../context/Balance";
import { useStaking } from "../context/Staking";
=======
import { useGameState } from "../context/GameState";
import { useStaking } from "../hooks/useStaking";
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11
import { useTicker } from "../hooks/useTicker";
import { useVisibleBlocks } from "../hooks/useVisibleBlocks";
import StakingChain from "./stakingPage/StakingChain";
import { AlertModal } from "../components/AlertModal";
import { BlockView } from "../components/BlockView";
import stakingConfig from "../configs/staking.json";

const SECOND = 1000;
<<<<<<< HEAD
=======

export type StakingPageProps = {
  switchPage: (page: string) => void;
};
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11

export const StakingPage: React.FC = (props) => {
  const { balance } = useBalance();
  const { stakingChains, stakingPools, stakeTokens, claimRewards, accrueAll } = useStaking();
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const tick = useTicker(SECOND);
<<<<<<< HEAD
=======
  const pools = gameState.stakingPools?.map((pool) => {
    useVisibleBlocks(pool.createdAt ?? 0, SECOND, 4);
  });
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11

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
<<<<<<< HEAD
    if (amt > balance) {
=======
    if (amt > gameState.balance) {
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11
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

<<<<<<< HEAD
      {stakingPools?.map((stakingPool, idx) => {
        const meta = stakingConfig[idx];
        const [visibleBlocks, blocksShown] = useVisibleBlocks(stakingPool.createdAt, tick, 4);
=======
      {gameState.stakingPools?.map((pool, idx) => {
        const meta = stakingConfig[idx];
        const [visibleBlocks, blocksShown] = useVisibleBlocks(pool.createdAt, tick, 4);
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11
        return (
          <StakingChain
          key={idx}
          idx={idx}
          meta={meta}
          visibleBlocks={visibleBlocks}
          blocksShown={blocksShown}
<<<<<<< HEAD
          stakingPool={stakingPool}
=======
          stakingPool={pool}
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11
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
