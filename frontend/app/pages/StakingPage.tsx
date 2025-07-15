import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { useStakingStore } from "../stores/useStakingStore";
import { useBalanceStore } from "../stores/useBalanceStore";
import { Canvas, Image, FilterMode, MipmapMode } from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";
import { Dimensions } from "react-native";

// You may need to define width, height, and getImage if not already imported:
const { width, height } = Dimensions.get("window");

const SECOND = 1000;

export const StakingPage: React.FC = () => {
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
  } = useStakingStore();
  const { tryBuy, updateBalance } = useBalanceStore();
  const [stakeInput, setStakeInput] = useState("0");
  const { getImage } = useImages();

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      SECOND
    );
    return () => clearInterval(id);
  }, []);

  // countdown until next validation
  const next = lastValidation + config.slashing_config.due_time;
  const rem = Math.max(next - now, 0);
  const days = Math.floor(rem / 86400);
  const hours = Math.floor((rem % 86400) / 3600);
  const minutes = Math.floor((rem % 3600) / 60);
  const seconds = rem % 60;

  // APR % = seconds-per-year / reward_rate * 100
  const apr = ((31 / config.reward_rate)).toFixed(1);

  const onPressClaim = () => {
    const rewards = claimStakingRewards();
    if (rewards > 0) {
      updateBalance(rewards);
    }
  }


  const onPressStake = () => {
    if (tryBuy(Number(stakeInput))) {
      stakeTokens(Number(stakeInput));
    }
  };

  const onPressFillStake = (i: number) => () => {
    setStakeInput((stakingIncrement * i).toString());
  };

  return (
    <View className="flex-1 relative">
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("background.staking")}
            fit="fill"
            x={0}
            y={-62}
            width={width}
            height={height}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>

          {/* Title */}
      <View className="w-full relative mb-9">
        <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
          <Image
            image={getImage("shop.title")}
            fit="fill"
            x={0}
            y={0}
            width={width - 8}
            height={24}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <Text className="text-[#fff7ff] text-xl font-bold absolute right-2 font-Pixels">
          STAKING
        </Text>
      </View>

      {/** === Claim your Bitcoin === */}
      <View className="w-full relative">
        <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
          <Image
            image={getImage("shop.title")}
            fit="fill"
            x={0}
            y={0}
            width={width - 8}
            height={24}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <Text className="text-[#fff7ff] text-xl font-bold absolute left-2 pl-2 font-Pixels">
          Claim your Bitcoin
        </Text>
      </View>

      <View className="mb-5">
        <View className="bg-[#16161d] border border-[#39274E] rounded-b-md p-3">
          {/* stats */}
          <View className="flex-row space-x-2 mb-3 ">
            <Text 
            className="flex-1 font-Pixels px-2 py-6 text-xl text-[#fff7ff] rounded border"
            style={{ borderColor: "#717171" }}
            >
              Staked: {amountStaked} BTC
            </Text>
            <View className="flex-1">
              <Text 
                className="font-Pixels px-2 py-6 text-xl text-[#fff7ff] rounded border"
                style={{ borderColor: "#717171" }}
              >
                APR: {apr}%
              </Text>
            </View>
          </View>

            {/* withdraw & boost */}
            <View className="flex-row mb-3">
              <TouchableOpacity
                onPress={withdrawStakedTokens}
                className="flex-1 py-4 rounded border bg-[#2c2c2e]"
                style={{ borderColor: "#717171" }}
              >
                <Text className="font-Pixels text-3xl text-center text-[#fff7ff]">
                  WITHDRAW
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {/* your boost APR logic */}}
                className="flex-1 px-2 py-4 rounded border bg-[#2c2c2e]"
                style={{ borderColor: "#717171" }}
              >
                <Text className="font-Pixels text-3xl text-center text-[#fff7ff]">
                  BOOST APR
                </Text>
              </TouchableOpacity>
            </View>

            {/* input + CLAIM */}
            <View className="flex-row items-center">
              <View className="flex-row flex-1 space-x-2">
                <Text
                  className="flex-1 px-3 py-2 rounded border font-Pixels text-xl"
                  style={{ borderColor: "#717171", color: "#fff7ff" }}
                >
                  {rewards}
                </Text>
                <Text
                  className="px-3 py-2 rounded border font-Pixels text-xl"
                  style={{ borderColor: "#717171", color: "#fff7ff" }}
                >
                BTC
                </Text>
              </View>
              <TouchableOpacity
                onPress={onPressClaim}
                className="ml-2 px-4 py-2 rounded border bg-[#2c2c2e]"
                style={{ borderColor: "#717171" }}
              >
                <Text className="font-Pixels text-xl text-[#fff7ff]">
                  CLAIM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/** === Stake your Bitcoin === */}
        <View className="w-full relative">
          <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
            <Image
              image={getImage("shop.title")}
              fit="fill"
              x={0}
              y={0}
              width={width - 8}
              height={24}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
          <Text className="text-[#fff7ff] text-xl font-bold absolute left-2 pl-2 font-Pixels">
            Stake your Bitcoin
          </Text>
        </View>

        <View className="mb-5">
          <View className="bg-[#16161d] border border-[#39274E] rounded-b-md p-3">

            {/* input + STAKE */}
            <View className="flex-row items-center">
              <View className="flex-row flex-1 space-x-2">
                <Text
                  className="flex-1 px-3 py-2 rounded border font-Pixels text-xl"
                  style={{ borderColor: "#717171", color: "#fff7ff" }}
                >
                  {rewards}
                </Text>
                <Text
                  className="px-3 py-2 rounded border font-Pixels text-xl"
                  style={{ borderColor: "#717171", color: "#fff7ff" }}
                >
                BTC
                </Text>
              </View>
              <TouchableOpacity
                onPress={onPressStake}
                className="ml-2 px-4 py-2 rounded border bg-[#2c2c2e]"
                style={{ borderColor: "#717171" }}
              >
                <Text className="font-Pixels text-xl text-white">
                  STAKE
                </Text>
              </TouchableOpacity>
            </View>
          </View>

            {/* quick-percent row */}
            <View className="flex-row justify-between">
              {[1,2,3,4,5].map((i) => (
                <TouchableOpacity
                  key={i}
                  onPress={onPressFillStake(i)}
                  className="flex-1 m-2 px-2 py-1 rounded border bg-[#2c2c2e]"
                  style={{ borderColor: "#717171" }}
                >
                  <Text className="font-Pixels text-xs text-[#fff7ff] text-center">
                    {i * stakingIncrement}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            </View>
  
        {/** === Validate your claim === */}

        <View className="mb-4">
          <View className="w-full relative">
            <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
              <Image
                image={getImage("shop.title")}
                fit="fill"
                x={0}
                y={0}
                width={width - 8}
                height={24}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Canvas>
            <Text className="text-[#fff7ff] text-xl font-bold absolute left-2 pl-2 font-Pixels">
              Validate your claim
            </Text>
          </View>
          <View
            className="bg-[#16161d] border border-[#39274E] rounded-b-md p-3 items-center"
          >
            <Text className="font-Pixels text-xl text-[#fff7ff]">
              {days.toString().padStart(2, "0")}:
              {hours.toString().padStart(2, "0")}:
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity
              onPress={validateStake}
              className="mt-3 w-full px-4 py-2 rounded border bg-[#2c2c2e]"
              style={{ borderColor: "#717171" }}
            >
              <Text className="font-Pixels text-xl text-[#fff7ff] text-center">
                VALIDATE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
};
