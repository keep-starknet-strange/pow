import {  View,
  Text,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useStakingStore } from "../stores/useStakingStore";

const SECOND = 1000;

export const StakingPage: React.FC = (props) => {
  const {
    amountStaked,
    rewards,
    config,
    lastValidation,
    stakingIncrement,
    validateStake,
    stakeTokens,
    claimStakingRewards,
    withdrawStakedTokens,
  } = useStakingStore()

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  // countdown until next validation
  const next = lastValidation + config.slashing_config.due_time
  const rem = Math.max(next - now, 0)
  const days    = Math.floor(rem / 86400)
  const hours   = Math.floor((rem % 86400) / 3600)
  const minutes = Math.floor((rem % 3600) / 60)
  const seconds = rem % 60

  // APR % = seconds-per-year / reward_rate * 100
  const apr = ((31536000 / config.reward_rate) * 100).toFixed(1)

  return (
 <View className="p-4">
      {/* Top row */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold">Staked: {amountStaked} BTC</Text>
          <Text className="text-gray-500 mt-1">APR: {apr}%</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className="px-3 py-2 border border-gray-300 rounded ml-2"
            onPress={() => withdrawStakedTokens()}
          >
            <Text>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* +inc & Claim */}
      <View className="flex-row justify-between items-center mt-4">
        <TouchableOpacity
          className="flex-1 px-4 py-3 border border-gray-300 rounded mr-2 items-center"
          onPress={() => claimStakingRewards()}
        >
          <Text>+ {rewards} BTC</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-4 py-3 bg-blue-600 rounded items-center"
          onPress={() => claimStakingRewards()}
        >
          <Text className="text-white font-semibold">Claim</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View className="border-t border-gray-300 border-dashed my-4" />

      {/* Manual input & Stake */}
      <View className="flex-row items-center">
        <View className="flex-1 px-4 py-3 border border-gray-300 rounded mr-2 items-center">
          <Text>{amountStaked}</Text>
        </View>
        <TouchableOpacity
          className="px-4 py-3 bg-blue-600 rounded items-center"
          onPress={() => {
            stakeTokens()
          }}
        >
          <Text className="text-white font-semibold">Stake</Text>
        </TouchableOpacity>
      </View>

      {/* Countdown */}
      <Text className="text-center mt-4 font-mono">
        {days} : {hours} : {minutes} : {seconds}
      </Text>

      {/* Validate */}
      <TouchableOpacity
        className="mt-4 px-4 py-3 bg-blue-600 rounded items-center"
        onPress={() => validateStake()}
      >
        <Text className="text-white font-semibold">Validate</Text>
      </TouchableOpacity>
    </View>
  );
};
