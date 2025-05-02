import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useEventManager } from "../context/EventManager";
import { useBalance } from "../context/Balance";
import { StakingPool, newStakingPool } from "../types/StakingPool";
import stakingConfig from "../configs/staking.json";
// TODO: use configuable function for time/block.id/block.time

function calculateRewards(
  stakedAmount: number,
  yieldMultiplier: number,
  elapsedSeconds: number
): number {
  // (staked * multiplier% * time) / (seconds in a year)
  return (stakedAmount * yieldMultiplier * elapsedSeconds)
       / (365 * 24 * 3600 * 100);
}

type StakingContextType = {
  stakingPools: StakingPool[];

  stakeTokens: (poolIdx: number, amount: number) => void;
  claimRewards: (poolIdx: number) => void;
  accrueAll: () => void;
  accrueAndCheckSlashingAll: () => void;
  stakingUnlocked: boolean;
  getStakingUnlockCost: (poolIdx: number) => number;
  unlockStaking: (poolIdx: number) => void;
}

export const useStaking = () => {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error("useStaking must be used within a StakingProvider");
  }
  return context;
}

const StakingContext = createContext<StakingContextType | undefined>(undefined);

const BLOCKS_PER_GAME_YEAR = 100;
export const StakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notify } = useEventManager();
  const { tryBuy, updateBalance } = useBalance();
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [stakingUnlocked, setStakingUnlocked] = useState(false);

  const resetStaking = () => {
    setStakingPools([]);
    setStakingUnlocked(false);
  }

  useEffect(() => {
    resetStaking();
  }, []);

  const getStakingUnlockCost = useCallback((poolIdx: number) => {
    return stakingConfig[poolIdx].unlockCosts[0];
    }, []);

  const unlockStaking = useCallback((poolIdx: number) => {
    const cost = getStakingUnlockCost(poolIdx);
    if(!tryBuy(cost)) return;
    setStakingUnlocked(true);
    setStakingPools(prev => {
      const pools = [...prev];
      pools[poolIdx] = newStakingPool(0, 0);
      return pools;
    })
  }, [tryBuy, notify]);

  const updatePool = (poolIdx: number, fn: (p: any) => any) =>
    setStakingPools((prev) => {
      const pools = [...prev];
      const pool = pools[poolIdx];
      if (!pool) return pools;
      pools[poolIdx] = fn(pool);
      return pools;
    });

  const stakeTokens = useCallback(
    (poolIdx: number, amount: number) => {
      if(!tryBuy(amount)) return;

      updatePool(poolIdx, pool => ({
        ...pool,
        stakedAmount: pool.stakedAmount + amount,
        lastBlockUpdated:  Math.floor(Date.now() / 1000),
        rewardAccrued: pool.rewardAccrued
      }));
    },
    [tryBuy]
  );

  const claimRewards = useCallback(
    (poolIdx: number) => {
      const pool = stakingPools[poolIdx];
      if (!pool) return;
      if (pool.rewardAccrued <= 0) return;
      updateBalance(pool.rewardAccrued);
      updatePool(poolIdx, pool => (
        {
        ...pool,
        rewardAccrued: 0,
        lastBlockUpdated: Math.floor(Date.now() / 1000)
      }));
    },
    [updateBalance, stakingPools]
  );

  const accrueAll = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
  
    setStakingPools(prev => {
      if (!prev) return prev;
  
      const newStakingPools = prev.map((pool, idx) => {
        if (pool.stakedAmount <= 0) return pool;
  
      const cfg = stakingConfig[idx];
      const elapsed = now - pool.lastBlockUpdated;
      const reward  = calculateRewards(
        pool.stakedAmount,
        cfg.yieldMultiplier,
        elapsed
      );
  
        return {
          ...pool,
          rewardAccrued: pool.rewardAccrued + reward,
          lastBlockUpdated: now,
        };
      });

      return newStakingPools;
    });
  }, []);

  const accrueAndCheckSlashingAll = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);

    setStakingPools(prevPools =>
      prevPools.map((pool, idx) => {
        if (pool.stakedAmount <= 0) return pool;

        const oldTs   = pool.lastBlockUpdated;
        const elapsed = now - oldTs;
        const cfg     = stakingConfig[idx];

        // 1) accrue rewards
        const reward = calculateRewards(
          pool.stakedAmount,
          cfg.yieldMultiplier,
          elapsed
        );

        // 2) maybe slash
        let updatedStake = pool.stakedAmount;
        if (elapsed > cfg.slashing.dueTime) {
          // scale probability by how far overdue
          const over = elapsed - cfg.slashing.dueTime;
          const prob = Math.min(cfg.slashing.chance * (over / cfg.slashing.dueTime), 1);

          if (Math.random() < prob) {
            const slashAmt = Math.floor(pool.stakedAmount * cfg.slashing.fraction);
            updatedStake -= slashAmt;
          }
        }

        // 3) reset timer for next cycle
        return {
          ...pool,
          rewardsEarned: updatedRewards,
          stakedAmount: updatedStake,
          lastBlockUpdated: now,
        };
      })
    );
  }, []);

  return (
    <StakingContext.Provider value={{
      stakingPools,
      accrueAll,
      stakeTokens, 
      claimRewards,
      stakingUnlocked, 
      unlockStaking, 
      getStakingUnlockCost,
      accrueAndCheckSlashingAll
    }}>
      {children}
    </StakingContext.Provider>
  );
}
