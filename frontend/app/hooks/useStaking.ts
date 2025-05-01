import { useCallback } from "react";
import { useGameState } from "../context/GameState";
import stakingConfig from "../configs/staking.json";

const BLOCKS_PER_GAME_YEAR = 100;      

export function useStaking() {
  const { gameState, setGameState, updateBalance } = useGameState();

  const poolFor = (chainIdx: number) =>
    gameState.stakingPools?.[chainIdx]

  const updatePool = (chainIdx: number, fn: (p: any) => any) =>
    setGameState(prev => {
      const stakingPools = [...(prev.stakingPools || [])];
      stakingPools[chainIdx] = fn({ ...stakingPools[chainIdx] });
      return { ...prev, stakingPools };
    });

  const stakeTokens = useCallback(
    (chainIdx: number, amount: number) => {
      if (gameState.balance < amount || amount <= 0) return;

      updateBalance(gameState.balance - amount);

      updatePool(chainIdx, pool => ({
        ...pool,
        stakedAmount: pool.stakedAmount + amount,
        lastBlockUpdated: Math.floor(Date.now() / 1000)
      }));
    },
    [gameState, updateBalance, updatePool]
  );

  const claimRewards = useCallback(
    (chainIdx: number) => {
      const pool = poolFor(chainIdx);
      if (!pool) return;
      if (pool.rewardAccrued <= 0) return;
      updateBalance(gameState.balance + pool.rewardAccrued);

      updatePool(chainIdx, pool => ({   
        ...pool,
        rewardAccrued: 0,
        startBlock: gameState.chains[chainIdx].currentBlock.id
      }));
    },
    [gameState]
  );

  const accrueAll = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    setGameState(prev => {
      if (!prev.stakingPools) return prev;
      const newStakingPools = prev.stakingPools.map((pool, idx) => {
        if (pool.stakedAmount <= 0) return pool;

        const blocksElapsed = (Date.now() / 1000) - pool.lastBlockUpdated;
        if (blocksElapsed <= 0) return pool;

        const meta = stakingConfig[idx]
        const annualRate = (meta.baseApy * meta.yieldMultiplier) / 100;
        const yieldPerBlock = ((pool.stakedAmount + pool.rewardAccrued) * annualRate) / BLOCKS_PER_GAME_YEAR;
        const rewardEarned = Math.floor(yieldPerBlock * blocksElapsed);

        return {
          ...pool,
          rewardAccrued: pool.rewardAccrued + rewardEarned,
          lastBlockUpdated: now,
        };
      });

      return {
        ...prev,
        stakingPools: newStakingPools,
      };
    });
  }, [setGameState]);

  return {
    stakeTokens,
    claimRewards,
    accrueAll,
    stakingInfo: gameState.stakingPools?.map(pools => pools)
  };
}
