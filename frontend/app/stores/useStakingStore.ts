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
  stakingIncrement: number;
  lastValidation: number;

  // actions
  stakeTokens: (amount: number) => void;
  validateStake: () => void;
  claimStakingRewards: () => number;
  withdrawStakedTokens: () => number;
}

export const useStakingStore = create<StakingState>((set, get) => {
  const cfg: StakingConfig = {
    reward_rate: stakingConfig.rewardRate,
    slashing_config: {
      slash_fraction: stakingConfig.slashingConfig.slashFraction,
      due_time: stakingConfig.slashingConfig.dueTime,
    },
  };

  return {
    config: cfg,
    amountStaked: 0,
    rewards: 0,
    stakingIncrement: Number(stakingConfig.minStake),
    lastValidation: Math.floor(Date.now() / 1000),

    validateStake: () => {
      const now = Math.floor(Date.now() / 1000);
      const { amountStaked, rewards, lastValidation, config } = get();
      if (amountStaked === 0) {
        set({ lastValidation: now });
        return;
      }

      set((state) => {
        if (now - state.lastValidation > 60) {
          return {
            lastValidation: now,
            rewards: state.rewards + state.amountStaked * 0.01,
          };
        }
        return {};
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
