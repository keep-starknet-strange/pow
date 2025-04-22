import { useCallback } from "react";
import { useGameState } from "../context/GameState";

const BLOCKS_PER_GAME_YEAR = 100; // 60 * 60 * 24 * 365 / 2.5s block time
const YIELD_BOOST     = 100000000000000;              

export function useStaking() {
  const { gameState, setGameState, updateBalance } = useGameState();

  const poolFor = (chainIdx: number) =>
    gameState.chains[chainIdx].stakingPool;

  const updatePool = (chainIdx: number, fn: (p: any) => any) =>
    setGameState(prev => {
      const chains = [...prev.chains];
      chains[chainIdx] = {
        ...chains[chainIdx],
        stakingPool: fn({ ...chains[chainIdx].stakingPool })
      };
      return { ...prev, chains };
    });

  const stakeTokens = useCallback(
    (chainIdx: number, amount: number) => {
      if (gameState.balance < amount || amount <= 0) return;

      updateBalance(gameState.balance - amount);

      updatePool(chainIdx, pool => ({
        stakedAmount: pool.stakedAmount + amount,
        startBlock:   gameState.chains[0].currentBlock.id,
        rewardAccrued: pool.rewardAccrued
      }));
    },
    [setGameState]
  );

  const claimRewards = useCallback(
    (chainIdx: number) => {
      const pool = poolFor(chainIdx);
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
    setGameState(prev => {
      const chains = prev.chains.map(chain => {
        const { stakingPool, apy, currentBlock } = chain as any; // adjust typing
        if (!stakingPool.stakedAmount) return chain;

        const blocks = currentBlock.id - stakingPool.lastBlockUpdated;
        if (blocks <= 0) return chain;

        const yieldPerBlock =
          (stakingPool.stakedAmount + stakingPool.rewardAccrued * (apy / 100) * YIELD_BOOST) / BLOCKS_PER_GAME_YEAR;
        return {
          ...chain,
          stakingPool: {
            ...stakingPool,
            rewardAccrued: stakingPool.rewardAccrued + yieldPerBlock * blocks,
            lastBlockUpdated: currentBlock.id
          }
        };
      });
      return { ...prev, chains };
    });
  }, [setGameState]);

  return {
    stakeTokens,
    claimRewards,
    accrueAll,
    stakingInfo: gameState.chains.map(c => c.stakingPool)
  };
}
