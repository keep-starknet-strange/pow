import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useEventManager } from "../context/EventManager";
import { useBalance } from "../context/Balance";
import { StakingPool, newStakingPool } from "../types/StakingPool";
import stakingConfig from "../configs/staking.json";

type StakingContextType = {
  stakingPools: StakingPool[];

  stakeTokens: (poolIdx: number, amount: number) => void;
  claimRewards: (poolIdx: number) => void;
  accrueAll: () => void;

  stakingUnlocked: boolean;
  getStakingUnlockCost: () => number;
  unlockStaking: () => void;
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

  const getStakingUnlockCost = useCallback(() => {
    return 500; // TODO: Replace with actual logic to get the cost
  }, []);

  const unlockStaking = () => {
    setStakingUnlocked((prevUnlocked) => {
      const cost = getStakingUnlockCost();
      if(!tryBuy(cost)) return prevUnlocked;
      setStakingPools(prev => {
        const pools = [...prev];
        pools[0] = newStakingPool(0, 0);
        return pools;
      }
      )
      notify("StakingPurchased");
      return true;
    });
  }

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
  
        const blocksElapsed = now - pool.lastBlockUpdated;
        if (blocksElapsed <= 0) return pool;
  
        const { baseApy, yieldMultiplier } = stakingConfig[idx];
        const annualRate   = (baseApy * yieldMultiplier) / 100;
        const yieldPerBlock = ((pool.stakedAmount + pool.rewardAccrued) * annualRate) / BLOCKS_PER_GAME_YEAR;
        const rewardEarned  = Math.floor(yieldPerBlock * blocksElapsed);
  
        return {
          ...pool,
          rewardAccrued: pool.rewardAccrued + rewardEarned,
          lastBlockUpdated: now,
        };
      });

      return newStakingPools;
    });
  }, []);

  return (
    <StakingContext.Provider value={{
      stakingPools, accrueAll, stakeTokens, claimRewards,
      stakingUnlocked, unlockStaking, getStakingUnlockCost
    }}>
      {children}
    </StakingContext.Provider>
  );
}
