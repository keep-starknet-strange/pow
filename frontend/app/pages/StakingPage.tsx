import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { useStakingStore } from "../stores/useStakingStore";
import { useBalanceStore } from "../stores/useBalanceStore";
import { Dimensions } from "react-native";
import { BackGround } from "../components/staking/BackGround";
import { PageHeader } from "../components/staking/PageHeader";
import { SectionTitle } from "../components/staking/SectionTitle";
import { StatsDisplay } from "../components/staking/StatsDisplay";
import { StakingAction } from "../components/staking/StakingAction";
import { AmountField } from "../components/staking/AmountField";
// import { Canvas, Image, FilterMode, MipmapMode } from "@shopify/react-native-skia";
// import { useImages } from "../hooks/useImages";

// You may need to define width, height, and getImage if not already imported:
const { width, height } = Dimensions.get("window");

const SECOND = 1000;
const BALANCE_PERCENTAGE = [5, 10, 25, 50, 100];

export const StakingPage: React.FC = () => {
  const {
    amountStaked,
    rewards,
    config,
    lastValidation,
    validateStake,
    stakeTokens,
    claimStakingRewards,
    withdrawStakedTokens,
  } = useStakingStore();
  const { tryBuy, updateBalance, balance } = useBalanceStore();
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  // const { getImage } = useImages();
  const balancePercentages = BALANCE_PERCENTAGE;
  interface GetPercentOfParams {
    percent: number;
    amount: number;
  }

  function getPercentOf({ percent, amount }: GetPercentOfParams): number {
    return (percent / 100) * amount;
  }

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), SECOND);
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
  const apr = (31 / config.reward_rate).toFixed(1);

  const onPressClaim = () => {
    const rewards = claimStakingRewards();
    if (rewards > 0) {
      updateBalance(rewards);
    }
  };

  const onPressStake = () => {
    if (tryBuy(stakeAmount)) {
      stakeTokens(stakeAmount);
    }
  };

  const onPressFillStake = (percent: number) => () => {
    setStakeAmount(getPercentOf({ percent, amount: balance }));
  };

  const onPressWithdraw = () => {
    const withdrawn = withdrawStakedTokens();
    if (withdrawn > 0) {
      updateBalance(withdrawn);
    }
  };

  console.log("Rendering StakingPage with state:");
  return (
    <SafeAreaView className="flex-1 relative">
      <BackGround width={width} height={height} />

      <PageHeader title="STAKING" width={width} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1"
      >
        {/** === Claim your Bitcoin === */}
        <SectionTitle title="Claim your Bitcoin" width={width} />

        <View className="mb-5">
          <View className="bg-[#16161d] border border-[#39274E] rounded-b-md p-3">
            <View className="flex-row space-x-2 mb-3 ">
              <StatsDisplay label="Staked" value={`${amountStaked} BTC`} />
              <StatsDisplay label="APR" value={`${apr} %`} />
            </View>

            <View className="flex-row space-x-4 mb-3 space-x-2">
              <StakingAction
                action={onPressWithdraw}
                label="WITHDRAW"
                disabled={amountStaked === 0}
              />
              <StakingAction
                action={() => {}}
                label="BOOST APR"
                disabled={true}
              />
            </View>

            <View className="flex-row items-center">
              <AmountField amount={rewards.toString()} />
              <StakingAction
                action={onPressClaim}
                label="CLAIM"
                disabled={rewards === 0}
              />
            </View>
          </View>
        </View>

        {/** === Stake your Bitcoin === */}
        <SectionTitle title="Stake your Bitcoin" width={width} />

        <View className="mb-5">
          <View className="bg-[#16161d] border border-[#39274E] rounded-b-md p-3">
            {/* input + STAKE */}
            <View className="flex-row items-center">
              <AmountField amount={stakeAmount.toString()} />
              <StakingAction
                action={onPressStake}
                label="STAKE"
                disabled={stakeAmount <= 0}
              />
            </View>
          </View>

          {/* quick select row */}
          <View className="relative px-2">
            {/* TODO: staking.amounts.bg */}
            {/* Canvas underlay */}
            {/* <Canvas
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: width - 16,   // matches px-2 (8px on each side)
              height: 48,          // adjust to your button height + vertical padding
            }}
          >
            <Image
              image={getImage("staking.amounts.bg")}
              fit="fill"
              x={0}
              y={0}
              width={width - 16}
              height={48}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas> */}

            <View className="flex-row space-x-2 px-2">
              {balancePercentages.map((percent, i) => (
                <StakingAction
                  key={i}
                  action={onPressFillStake(percent)}
                  label={`${percent}%`}
                />
              ))}
            </View>
          </View>
        </View>

        {/** === Validate your claim === */}

        <View className="">
          <SectionTitle title="Validate your claim" width={width} />

          <View className="bg-[#16161d] border border-[#39274E] rounded-b-md p-3 items-center">
            <Text className="font-Pixels text-5xl text-[#fff7ff]">
              {days.toString().padStart(2, "0")}:
              {hours.toString().padStart(2, "0")}:
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </Text>
          </View>

          <StakingAction action={validateStake} label="VALIDATE" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
