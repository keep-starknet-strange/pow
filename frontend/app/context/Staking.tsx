import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useEventManager } from "../context/EventManager";
import { useBalance } from "../context/Balance";
import { Chain, newChain, newBlock } from "../types/Chains";
import { StakingPool, newStakingPool } from "../types/StakingPool";
import stakingConfig from "../configs/staking.json";

type StakingContextType = {
  stakingChains: Chain[];
  stakingPools: StakingPool[];
  getStakingChain: (chainId: number) => Chain | undefined;
  getStakingPool: (chainId: number) => StakingPool | undefined;

  stakeTokens: (chainIdx: number, amount: number) => void;
  claimRewards: (chainIdx: number) => void;
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

  const [stakingChains, setStakingChains] = useState<Chain[]>([]);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [stakingUnlocked, setStakingUnlocked] = useState(false);

  const resetStaking = () => {
    const initChain = newChain(0);
    initChain.blocks = [newBlock(0, 1)];
    setStakingChains([initChain]);
    setStakingPools([newStakingPool(0, 0, 0, 0)]);
    setStakingUnlocked(false);
  }
  useEffect(() => {
    resetStaking();
  }, []);

  const getStakingChain = useCallback((chainId: number) => {
    if (!stakingChains) return undefined;
    return stakingChains[chainId] || undefined;
  }, [stakingChains]);

  // TODO: Use find w/ chainId
  const getStakingPool = useCallback((chainId: number) => {
    if (!stakingPools) return undefined
    return stakingPools[chainId] || undefined;
  }, [stakingPools]);

  const getStakingUnlockCost = useCallback(() => {
    return 500; // TODO: Replace with actual logic to get the cost
  }, []);

  const unlockStaking = () => {
    setStakingUnlocked((prevUnlocked) => {
      const cost = getStakingUnlockCost();
      if(!tryBuy(cost)) return prevUnlocked;
      notify("StakingPurchased");
      return true;
    });
  }

  const updatePool = (chainIdx: number, fn: (p: any) => any) =>
    setStakingPools((prev) => {
      const pools = [...prev];
      const pool = pools[chainIdx];
      if (!pool) return pools;
      pools[chainIdx] = fn(pool);
      return pools;
    });

  const stakeTokens = useCallback(
    (chainIdx: number, amount: number) => {
      if(!tryBuy(amount)) return;

      updatePool(chainIdx, pool => ({
        stakedAmount: pool.stakedAmount + amount,
        startBlock: stakingChains[chainIdx].blocks[0],
        rewardAccrued: pool.rewardAccrued
      }));
    },
    [stakingChains]
  );

  const claimRewards = useCallback(
    (chainIdx: number) => {
      const pool = getStakingPool(chainIdx);
      if (!pool) return;
      if (pool.rewardAccrued <= 0) return;
      updateBalance(pool.rewardAccrued);

      updatePool(chainIdx, pool => ({
        ...pool,
        rewardAccrued: 0,
        startBlock: stakingChains[chainIdx].blocks.length,
      }));
    },
    [stakingChains, getStakingPool, updateBalance]
  );

  const accrueAll = useCallback(() => {
    setStakingPools(prev => {
      const pools = prev.map(pool => {
        const meta = stakingConfig.find(c => c.chainId === pool.chainId)!;
        const currentBlock = stakingChains[pool.chainId].blocks[-1];
        if (!pool.stakedAmount) return pool;

        const blocks = currentBlock.blockId - pool.lastBlockUpdated;
        if (blocks <= 0) return pool;

        const apy = meta.baseApy * meta.yieldMultiplier;
        const yieldPerBlock =
          (pool.stakedAmount + pool.rewardAccrued * (apy / 100)) / BLOCKS_PER_GAME_YEAR;
        return {
          ...pool,
          rewardAccrued: pool.rewardAccrued + yieldPerBlock * blocks,
          lastBlockUpdated: currentBlock.blockId
        };
      });
      return pools;
    });
  }, [stakingChains]);

  return (
    <StakingContext.Provider value={{
      stakingChains, getStakingChain,
      stakingPools, getStakingPool, accrueAll, stakeTokens, claimRewards,
      stakingUnlocked, unlockStaking, getStakingUnlockCost
    }}>
      {children}
    </StakingContext.Provider>
  );
}
