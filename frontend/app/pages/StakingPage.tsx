import { View, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  const { days, hours, minutes, seconds } = useMemo(() => {
    const next = lastValidation + config.slashing_config.due_time;
    const rem = Math.max(next - now, 0);
    return {
      days: Math.floor(rem / 86400),
      hours: Math.floor((rem % 86400) / 3600),
      minutes: Math.floor((rem % 3600) / 60),
      seconds: rem % 60,
    };
  }, [lastValidation, config.slashing_config.due_time, now]);

  // APR % = seconds-per-year / reward_rate * 100
  const apr = useMemo(() => (31 / config.reward_rate).toFixed(1), [config.reward_rate]);

  const onPressClaim = useCallback(() => {
    const r = claimStakingRewards();
    if (r > 0) {
      updateBalance(r);
    }
  }, [claimStakingRewards, updateBalance]);

  const onPressStake = useCallback(() => {
    if (tryBuy(stakeAmount)) {
      stakeTokens(stakeAmount);
    }
  }, [stakeAmount, tryBuy, stakeTokens]);

  const onPressFillStake = useCallback(
    (percent: number) => () => {
      setStakeAmount(getPercentOf({ percent, amount: balance }));
    },
    [balance]
  );

  const onPressWithdraw = useCallback(() => {
    const withdrawn = withdrawStakedTokens();
    if (withdrawn > 0) {
      updateBalance(withdrawn);
    }
  }, [withdrawStakedTokens, updateBalance]);

  return (
    <SafeAreaView style={styles.screen}>
      <BackGround width={width} height={height} />

      <PageHeader title="STAKING" width={width} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} style={styles.flex1}>
        {/** === Claim your Bitcoin === */}
        <SectionTitle title="Claim your Bitcoin" width={width} />

        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.rowStats}>
              <StatsDisplay label="Staked" value={`${amountStaked} BTC`} />
              <StatsDisplay label="APR" value={`${apr} %`} />
            </View>

            <View style={styles.rowActions}>
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

            <View style={styles.rowCenter}>
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

        <View style={styles.section}>
          <View style={styles.card}>
            {/* input + STAKE */}
            <View style={styles.rowCenter}>
              <AmountField amount={stakeAmount.toString()} />
              <StakingAction
                action={onPressStake}
                label="STAKE"
                disabled={stakeAmount <= 0}
              />
            </View>
          </View>

          {/* quick select row */}
          <View style={styles.relativePad}>
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

            <View style={styles.percRow}>
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

        <View style={styles.section}>
          <SectionTitle title="Validate your claim" width={width} />

          <View style={[styles.card, styles.center]}>
            <Text style={styles.countdownText}>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
  },
  flex1: {
    flex: 1,
  },
  section: {
    marginBottom: 20, // mb-5
  },
  card: {
    backgroundColor: "#16161d",
    borderWidth: 1,
    borderColor: "#39274E",
    padding: 12, // p-3
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  rowStats: {
    flexDirection: "row",
    columnGap: 8, // space-x-2
    marginBottom: 12, // mb-3
  },
  rowActions: {
    flexDirection: "row",
    columnGap: 8,
    marginBottom: 12,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  relativePad: {
    position: "relative",
    paddingHorizontal: 8, // px-2
  },
  percRow: {
    flexDirection: "row",
    columnGap: 8, // space-x-2
    paddingHorizontal: 8, // px-2
  },
  center: {
    alignItems: "center",
  },
  countdownText: {
    fontFamily: "Pixels",
    fontSize: 48, // text-5xl
    color: "#fff7ff",
  },
});
