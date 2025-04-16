import { useCallback, useEffect } from "react";
import { useGameState } from "../context/GameState";
import { useEventManager, Observer } from "../context/EventManager";

const BLOCKS_PER_YEAR = 10512000; // 60 * 60 * 24 * 365 / 2.5s block time

export function useStaking() {
  const { gameState, setGameState, updateBalance } = useGameState();
  const { registerObserver, unregisterObserver } = useEventManager();

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
    [gameState]
  );

  const claimRewards = useCallback(
    (chainIdx: number) => {
      const pool = poolFor(chainIdx);
      if (pool.rewardAccrued <= 0) return;
      updateBalance(gameState.balance + pool.rewardAccrued);

      updatePool(chainIdx, pool => ({
        ...pool,
        rewardAccrued: 0,
        startBlock: gameState.chains[0].currentBlock.id
      }));
    },
    [gameState]
  );

  useEffect(() => {
    const obs: Observer = {
      onNotify(eventName: string, data?: any) {
        if (eventName !== "BlockFinalized") return;

        const { block } = data;
        setGameState(prev => {
          const chains = prev.chains.map(chain => {
            const { stakingPool, apy } = chain;
            if (!stakingPool.stakedAmount) return chain;

            const blocks = block.id - stakingPool.startBlock;
            if (blocks <= 0) return chain;

            const yieldPerBlock =
              (stakingPool.stakedAmount * (apy / 100)) / BLOCKS_PER_YEAR;

            return {
              ...chain,
              stakingPool: {
                ...stakingPool,
                rewardAccrued: stakingPool.rewardAccrued + yieldPerBlock * blocks,
                lastUpdateBlock: block.id
              }
            };
          });
          return { ...prev, chains };
        });
      }
    };

    const id = registerObserver(obs);
    return () => unregisterObserver(id);
  }, [registerObserver, unregisterObserver, setGameState]);

  return {
    stakeTokens,
    claimRewards,
    stakingInfo: gameState.chains.map(c => c.stakingPool)
  };
}
