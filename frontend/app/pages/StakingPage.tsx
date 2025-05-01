import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useBalance } from "../context/Balance";
import { useStaking } from "../context/Staking";
import { useTicker } from "../hooks/useTicker";
import { useVisibleBlocks } from "../hooks/useVisibleBlocks";
import { AlertModal } from "../components/AlertModal";
import { BlockView } from "../components/BlockView";
import stakingConfig from "../configs/staking.json";

const SECOND = 1000;

export const StakingPage: React.FC = (props) => {
  const { balance } = useBalance();
  const { stakingChains, stakingPools, stakeTokens, claimRewards, accrueAll } = useStaking();
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const tick = useTicker(SECOND);

  useFocusEffect(
    React.useCallback(() => {
      accrueAll();         
    }, [accrueAll])
  );

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
          <View key={`stakingPoolKey${idx}`} className="bg-gray-800 rounded-2xl p-5 mt-6">

            <Text className="text-white text-lg font-semibold mb-2">
              {meta?.icon} {meta.name}
            </Text>

            {blocksShown > 0 && (
                <View className="flex-row-reverse w-full px-2 mt-4">
                {visibleBlocks.map((block: Block, bi: number) => (
                  <View key={block.id ?? bi} className="flex-row items-center">
                  <View className="h-28 w-28">
                    <BlockView block={block} />
                  </View>
                  {bi !== 0 && (
                    <View className="w-2 h-1 mx-[2px] bg-[#f9f9f980] rounded-lg" />
                  )}
                  </View>
                ))}
                </View>
            )}

            {/* staked + claim row */}
            <View className="flex-row items-center justify-center gap-x-8 mt-4 mb-3">
              <Text className="text-white">
                {stakingPool.stakedAmount.toFixed(2) + " staked"}
              </Text>

              <TouchableOpacity onPress={() => claimRewards(idx)}>
                <Text className="text-green-400">
                  {"Claim " + stakingPool?.rewardAccrued.toFixed(2)}
                </Text>
              </TouchableOpacity>
            </View>

           {/* single-stake button */}
           <View className="flex-row justify-center mt-2">
              <TouchableOpacity
                onPress={() => onPressStake(meta.chainId, meta.stakingAmount)}
                className="bg-blue-600 px-6 py-2 rounded-xl"
              >
                <Text className="text-white font-semibold">
                  Stake {meta.stakingAmount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

    <AlertModal
      visible={insufficientFunds}
      title="Insufficient Funds"
      onClose={() => setInsufficientFunds(false)}
    />
  </View>
  )
}
