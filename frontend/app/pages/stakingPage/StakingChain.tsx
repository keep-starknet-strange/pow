import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BlockView from '../../components/BlockView';
import type { Block } from '../../types/Chains';

export interface StakingChainProps {
  idx: number;
  meta: {
    icon: React.ReactNode;
    name: string;
    chainId: number;
    stakingAmount: number;
  };
  visibleBlocks: Block[];
  blocksShown: number;
  stakingPool: {
    stakedAmount: number;
    rewardAccrued: number;
  };
  claimRewards: (idx: number) => void;
  onPressStake: (chainId: number, amount: number) => void;
}

const StakingChain: React.FC<StakingChainProps> = ({
  idx,
  meta,
  visibleBlocks,
  blocksShown,
  stakingPool,
  claimRewards,
  onPressStake,
}) => (
  <View className="bg-gray-800 rounded-2xl p-5 mt-6">
    <Text className="text-white text-lg font-semibold mb-2">
      {meta.icon} {meta.name}
    </Text>

    {blocksShown > 0 && (
      <View className="flex-row-reverse w-full px-2 mt-4">
        {visibleBlocks.map((block, bi) => (
          <View key={block.blockId ?? bi} className="flex-row items-center">
            <View className="h-28 w-28">
              <BlockView chainId={3} block={block} completed={true}/>
            </View>
            {bi !== 0 && (
              <View className="w-2 h-1 mx-[2px] bg-[#f9f9f980] rounded-lg" />
            )}
          </View>
        ))}
      </View>
    )}

    <View className="flex-row items-center justify-center gap-x-8 mt-4 mb-3">
      <Text className="text-white">
        {stakingPool.stakedAmount.toFixed(2)} staked
      </Text>

      <TouchableOpacity onPress={() => claimRewards(idx)}>
        <Text className="text-green-400">
          Claim {stakingPool.rewardAccrued.toFixed(2)}
        </Text>
      </TouchableOpacity>
    </View>

    <View className="flex-row justify-center mt-2">
      <TouchableOpacity
        onPress={() => onPressStake(idx, meta.stakingAmount)}
        className="bg-blue-600 px-6 py-2 rounded-xl"
      >
        <Text className="text-white font-semibold">
          Stake {meta.stakingAmount.toFixed(2)}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default StakingChain;
