import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useStakingStore } from "../stores/useStakingStore";
import { useBalanceStore } from "../stores/useBalanceStore";
import { Dimensions } from "react-native";
import { BackGround } from "../components/staking/BackGround";
import { PageHeader } from "../components/staking/PageHeader";
import { SectionTitle } from "../components/staking/SectionTitle";
import { StatsDisplay } from "../components/staking/StatsDisplay";
import { StakingAction } from "../components/staking/StakingAction";
import { Window } from "../components/tutorial/Window";
import { AmountField } from "../components/staking/AmountField";
import { StakingUnlock } from "../components/staking/StakingUnlock";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
import { shortMoneyString, showThreeDigitsMax } from "../utils/helpers";
// import { Canvas, Image, FilterMode, MipmapMode } from "@shopify/react-native-skia";
// import { useImages } from "../hooks/useImages";


const SECOND = 1000;
const BALANCE_PERCENTAGE = [5, 10, 25, 50, 100];

export const StakingPage: React.FC = () => {
  const { width, height } = useCachedWindowDimensions();
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
  const isUnlocked = useStakingStore((s) => s.isUnlocked);
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
    if (!isUnlocked || amountStaked === 0) return; // pause timer when locked or nothing staked
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), SECOND);
    return () => clearInterval(id);
  }, [isUnlocked, amountStaked]);

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

  // Build a countdown string without leading zero segments (e.g., 00:00:23:59 -> 23:59)
  const countdownDisplay = useMemo(() => {
    const parts = [days, hours, minutes, seconds]
      .map((n) => n.toString().padStart(2, "0"));
    // Remove leading 00 segments but keep at least minutes:seconds
    while (parts.length > 2 && parts[0] === "00") {
      parts.shift();
    }
    return parts.join(":");
  }, [days, hours, minutes, seconds]);

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

      <View
        style={[
          styles.flex1,
          styles.contentContainer,
          { opacity: isUnlocked ? 1 : 0.35 },
        ]}
      >
        {/** === Claim your Bitcoin === */}
        <SectionTitle title="Claim your Bitcoin" width={width} />

        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.rowStats}>
              <StatsDisplay label="Staked" value={`${shortMoneyString(amountStaked, false, 1)} BTC`} />
              <StatsDisplay label="APR" value={`${apr} %`} />
            </View>

            <View style={styles.rowActions}>
              <StakingAction
                action={onPressWithdraw}
                label="WITHDRAW"
                disabled={amountStaked === 0}
                expand={false}
                style={{ paddingHorizontal: 24, marginHorizontal: 2 }}
              />
              <StakingAction
                action={onPressClaim}
                label="BOOST APR"
                disabled={rewards === 0}
                expand={false}
                style={{ paddingHorizontal: 24, marginHorizontal: 2 }}
              />
            </View>

            <View style={styles.rowCenter}>
              <AmountField amount={shortMoneyString(rewards)} />
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
              <AmountField amount={shortMoneyString(stakeAmount)} />
              <StakingAction
                action={onPressStake}
                label="STAKE"
                disabled={stakeAmount <= 0}
              />
            </View>
          </View>

          {/* quick select row */}
          <View style={styles.relativePad}>
            <View style={styles.percRow}>
              {balancePercentages.map((percent, i) => (
                <StakingAction
                  key={i}
                  action={onPressFillStake(percent)}
                  label={`${percent}%`}
                  labelSize={28}
                  style={styles.pctButton}
                />
              ))}
            </View>
          </View>
        </View>

        {/** === Validate your claim === */}

        <View style={styles.section}>
          <SectionTitle title="Validate your claim" width={width} />

          <View style={styles.card}>
            <Window style={{ width: "98%", alignSelf: "center" }}>
              <Text style={styles.countdownText}>
                {countdownDisplay}
              </Text>
            </Window>
          </View>
            <StakingAction action={validateStake} label="VALIDATE" expand={false} style={{ marginTop: 8, alignSelf: "center", paddingHorizontal: 100 }} />

        </View>
      </View>

      {!isUnlocked && (
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.overlayBackdrop} />
          <View style={styles.overlayContent}>
            <StakingUnlock alwaysShow hidden={false} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
    opacity: 0.5,
  },
  overlayContent: {
    width: "100%",
  },
  flex1: {
    flex: 1,
  },
  contentContainer: {
    justifyContent: "flex-start",
    paddingBottom: 8,
  },
  section: {
    marginBottom: 14,
  },
  card: {
    padding: 3, // p-3
  },
  rowStats: {
    flexDirection: "row",
    marginBottom: 12, // mb-3
    marginHorizontal: 8,
  },
  rowActions: {
    flexDirection: "row",
    marginBottom: 12,
    justifyContent: "center",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  relativePad: {
    position: "relative",
  },
  percRow: {
    flexDirection: "row",
    paddingHorizontal: 8, // px-2
  },
  pctButton: {
    height: 56,
    flexBasis: 0,
    minWidth: 0,
  },
  center: {
    alignItems: "center",
  },
  countdownText: {
    fontFamily: "Pixels",
    fontSize: 36,
    color: "#fff7ff",
  },
});
