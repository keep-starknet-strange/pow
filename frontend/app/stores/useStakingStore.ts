import { create } from "zustand";
import stakingConfig from "../configs/staking.json";

interface SlashingConfig {
  slash_fraction: number; // e.g. 10 means “1/10th slashed per period”
  due_time: number; // seconds between allowed validations
}

interface StakingConfig {
  reward_rate: number; // divisor for reward calc
  slashing_config: SlashingConfig;
}

interface StakingState {
  config: StakingConfig;
  amountStaked: number;
  rewards: number;
  lastValidation: number;
  lastRewardAccrual: number;

  // actions
  stakeTokens: (amount: number) => void;
  validateStake: () => void;
  claimStakingRewards: () => number;
  withdrawStakedTokens: () => number;
}

export const useStakingStore = create<StakingState>((set, get) => {
  const cfg: StakingConfig = {
    reward_rate: stakingConfig.baseRewardRate,
    slashing_config: {
      slash_fraction: stakingConfig.slashingConfig.slashFraction,
      due_time: stakingConfig.slashingConfig.dueTime,
    },
  };

  return {
    config: cfg,
    amountStaked: 0,
    rewards: 0,
    lastValidation: Math.floor(Date.now() / 1000),
    lastRewardAccrual: Math.floor(Date.now() / 1000),

    validateStake: () => {
      const now = Math.floor(Date.now() / 1000);
      const { amountStaked } = get();
      if (amountStaked === 0) {
        set({ lastValidation: now, lastRewardAccrual: now });
        return;
      }

      set((state) => {
        // --- Hourly rewards accrual ---
        const SECONDS_PER_HOUR = 3600;
        const hoursSinceAccrual = Math.floor(
          (now - state.lastRewardAccrual) / SECONDS_PER_HOUR
        );
        const hourlyRewardRate = state.config.reward_rate; // fraction per hour
        const rewardsDelta =
          hoursSinceAccrual > 0
            ? state.amountStaked * hourlyRewardRate * hoursSinceAccrual
            : 0;

        // --- Daily slashing (every due_time seconds) ---
        const dueTime = state.config.slashing_config.due_time; // expect 24h
        const slashFraction = state.config.slashing_config.slash_fraction; // fraction per period
        const periodsOverdue = Math.floor((now - state.lastValidation) / dueTime);
        let newAmountStaked = state.amountStaked;
        if (periodsOverdue > 0 && newAmountStaked > 0) {
          const remainingMultiplier = Math.pow(1 - slashFraction, periodsOverdue);
          newAmountStaked = newAmountStaked * remainingMultiplier;
        }

        return {
          amountStaked: newAmountStaked,
          rewards: state.rewards + rewardsDelta,
          lastRewardAccrual:
            hoursSinceAccrual > 0
              ? state.lastRewardAccrual + hoursSinceAccrual * SECONDS_PER_HOUR
              : state.lastRewardAccrual,
          lastValidation: now,
        };
      });
    },

    stakeTokens: (amount) => {
      get().validateStake();
      set((state) => {
        const newAmount = state.amountStaked + amount;
        return {
          amountStaked: newAmount,
        };
      });
    },

    claimStakingRewards: () => {
      const { rewards } = get();
      if (rewards === 0) {
        return 0;
      }
      set(() => ({
        rewards: 0,
      }));
      return rewards;
    },

    withdrawStakedTokens: () => {
      const { amountStaked } = get();
      if (amountStaked === 0) {
        return 0;
      }
      set(() => ({
        amountStaked: 0,
      }));
      return amountStaked;
    },
  };
});
