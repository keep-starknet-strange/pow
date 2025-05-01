import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useBalance } from "../context/Balance";
import { useStaking } from "../context/Staking";
import { AlertModal } from "../components/AlertModal";
import { StakingChainView } from "../components/StakingChainView";
import stakingConfig from "../configs/staking.json";

export const StakingPage: React.FC = (props) => {
  const { balance } = useBalance();
  const { stakingChains, getStakingPool, stakeTokens, claimRewards, accrueAll } = useStaking();
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      accrueAll();         
    }, [accrueAll])
  );

  const [inputs, setInputs] = useState<string[]>(
    Array(stakingChains.length).fill("")
  );

  const handleInput = (idx: number, text: string) =>
    setInputs(arr => {
      const next = [...arr];
      next[idx] = text;
      return next;
    });

  const handleStake = (idx: number) => {
    const amount = parseFloat(inputs[idx]);
    if (!isNaN(amount) && amount > 0) {
      if (amount > balance) {
        setInsufficientFunds(true);
        handleInput(idx, ""); 
        return;
      }
      stakeTokens(idx, amount);
      handleInput(idx, "");           // clear the field
    }
  };
  return (
    <View className="flex-1 bg-gray-900 px-4 py-6">
      <View className="flex flex-row justify-end items-center p-2">
        <Text className="text-[#e7e7e7] text-4xl font-bold mr-2">🥩Staking</Text>
      </View>

      {stakingChains.map((chain, idx) => {
        const pool = getStakingPool(chain.chainId);
        const meta = stakingConfig.find(c => c.chainId === chain.chainId)!;
        return (
          <View key={idx} className="bg-gray-800 rounded-2xl p-5 mt-6">

            <Text className="text-white text-lg font-semibold mb-2">
              {meta?.icon} {meta.name}
            </Text>
            <StakingChainView chainId={chain.chainId} />

            {/* staked + claim row */}
            <View className="flex-row items-center justify-center gap-x-8 mt-4 mb-3">
              <Text className="text-white">
                {pool?.stakedAmount.toFixed(2) + " staked"}
              </Text>

              <TouchableOpacity onPress={() => claimRewards(idx)}>
                <Text className="text-green-400">
                  {"Claim " + pool?.rewardAccrued.toFixed(2)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* stake input */}
            <View className="flex-row items-center">
              <TextInput
                value={inputs[idx]}
                onChangeText={txt => handleInput(idx, txt)}
                keyboardType="number-pad"
                placeholder="Amount"
                placeholderTextColor="#888"
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l-xl"
              />
              <TouchableOpacity
                onPress={() => handleStake(idx)}
                className="bg-blue-600 px-4 py-2 rounded-r-xl ml-[1px]"
              >
                <Text className="text-white font-semibold">Stake</Text>
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
