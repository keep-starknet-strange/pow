import { create } from "zustand";
import { Contract } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import stakingConfig from "../configs/staking.json";
import { useTransactionsStore } from "./useTransactionsStore";
import { useBalanceStore } from "./useBalanceStore";
import { useEventManager } from "./useEventManager";
// Staking unlock gating is controlled by a specific dApp level in TransactionsStore

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
  boostApr: () => void;

  // initialization
  initializeStaking: (
    powContract: Contract | null,
    user: FocAccount | null,
    getStakingConfig: () => Promise<
      | {
          reward_rate: number;
          slashing_config: { slash_fraction: number; due_time: number };
        }
      | undefined
    >,
    getUserStakedAmount: () => Promise<number | undefined>,
    getUserRewardAmount: () => Promise<number | undefined>,
    getUserStakingUnlocked: () => Promise<boolean | undefined>,
  ) => Promise<void>;

  // unlock state/actions
  isUnlocked: boolean;
  canUnlockStaking: () => boolean;
  getUnlockCost: () => number;
  unlockStaking: () => void;
}

export const useStakingStore = create<StakingState>((set, get) => {
  const computePaaveUnlocked = (): boolean => {
    // Delegate to TransactionsStore so logic stays centralized
    return useTransactionsStore.getState().canUnlockStaking(0);
  };

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
    isUnlocked: false,
    canUnlockStaking: () => computePaaveUnlocked(),

    validateStake: () => {
      const now = Math.floor(Date.now() / 1000);
      const { amountStaked } = get();
      if (amountStaked === 0) {
        set({ lastValidation: now, lastRewardAccrual: now });
        return;
      }

      set((state) => {
        // --- Validation gating ---
        const dueTime = state.config.slashing_config.due_time;
        const slashFraction = state.config.slashing_config.slash_fraction;
        const secondsSinceValidation = now - state.lastValidation;

        // Not yet due: do nothing
        if (secondsSinceValidation < dueTime) {
          return {} as any;
        }

        let newAmountStaked = state.amountStaked;
        let rewardsDelta = 0;

        // Rewards accrue proportionally to time since last validation
        // Using existing reward_rate semantics (fraction per hour)
        const SECONDS_PER_HOUR = 3600;
        const hoursSinceAccrual = Math.floor(
          (now - state.lastRewardAccrual) / SECONDS_PER_HOUR,
        );
        const hourlyRewardRate = state.config.reward_rate; // fraction per hour
        rewardsDelta =
          hoursSinceAccrual > 0
            ? state.amountStaked * hourlyRewardRate * hoursSinceAccrual
            : 0;

        // Apply slashing if overdue by periods
        const periodsOverdue = Math.floor(secondsSinceValidation / dueTime);
        if (periodsOverdue > 0 && newAmountStaked > 0) {
          const remainingMultiplier = Math.pow(
            1 - slashFraction,
            periodsOverdue,
          );
          newAmountStaked = newAmountStaked * remainingMultiplier;
        }

        return {
          amountStaked: newAmountStaked,
          rewards: state.rewards + rewardsDelta,
          lastRewardAccrual: rewardsDelta > 0 ? now : state.lastRewardAccrual,
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

    boostApr: () => {
      const { rewards } = get();
      if (rewards <= 0) return;
      set((state) => ({
        rewards: 0,
        config: {
          ...state.config,
          reward_rate: Math.max(0.000001, state.config.reward_rate * 0.9),
        },
      }));
    },

    initializeStaking: async (
      powContract,
      user,
      getStakingConfig,
      getUserStakedAmount,
      getUserRewardAmount,
      getUserStakingUnlocked,
    ) => {
      if (!user || !powContract) {
        // Fallback to defaults when not connected
        set({ isUnlocked: false });
        return;
      }
      try {
        const [cfg, staked, reward, unlocked] = await Promise.all([
          getStakingConfig(),
          getUserStakedAmount(),
          getUserRewardAmount(),
          getUserStakingUnlocked(),
        ]);

        set((state) => ({
          config: cfg
            ? {
                reward_rate: Number(cfg.reward_rate),
                slashing_config: {
                  slash_fraction: Number(cfg.slashing_config.slash_fraction),
                  due_time: Number(cfg.slashing_config.due_time),
                },
              }
            : state.config,
          amountStaked: staked ?? state.amountStaked,
          rewards: reward ?? state.rewards,
          isUnlocked: unlocked ?? state.isUnlocked,
          lastValidation: state.lastValidation,
          lastRewardAccrual: state.lastRewardAccrual,
        }));
      } catch (error) {
        if (__DEV__) console.error("Error initializing staking:", error);
      }
    },

    getUnlockCost: () => 42,

    unlockStaking: () => {
      if (get().isUnlocked) return;
      if (!get().canUnlockStaking()) {
        useEventManager.getState().notify("InvalidPurchase");
        return;
      }
      const cost = get().getUnlockCost();
      if (!useBalanceStore.getState().tryBuy(cost)) {
        useEventManager.getState().notify("BuyFailed");
        return;
      }
      set({ isUnlocked: true });
      useEventManager.getState().notify("StakingPurchased");
    },
  };
});
