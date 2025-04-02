// hooks/useBlockActions.ts
import { useCallback } from "react";
import { useCurrentBlock } from "../context/CurrentBlock";
import { useGameState } from "../context/GameState";
import { useEventManager } from "../context/EventManager";
import { newBlock } from "../types/Block";
import { Transaction } from "../types/Transaction";

export const useBlockActions = () => {
  const { currentBlock, setCurrentBlock } = useCurrentBlock();
  const { gameState, setGameState, upgradableGameState } = useGameState();
  const { notify } = useEventManager();

  const finalizeBlock = useCallback(() => {
    const finalizedBlock = currentBlock;
    notify("BlockFinalized", { block: finalizedBlock });

    const newCurrentBlock = newBlock(
      finalizedBlock.id + 1,
      upgradableGameState.blockReward,
      upgradableGameState.blockSize,
      upgradableGameState.difficulty
    );

    setCurrentBlock(newCurrentBlock);
    notify("BlockCreated", { block: newCurrentBlock });

    const newBalance = gameState.balance + finalizedBlock.reward + finalizedBlock.fees;

    setGameState(prevState => {
      const updatedChains = prevState.chains.map(chain =>
        chain.id === 0
          ? { ...chain, blocks: [finalizedBlock, ...(chain.blocks ?? []).slice(0, 4)] }
          : chain
      );

      return {
        ...prevState,
        balance: newBalance,
        chains: updatedChains,
      };
    });

    notify("BalanceUpdated", { balance: newBalance });
  }, [currentBlock, gameState.balance, notify, setCurrentBlock, setGameState, upgradableGameState]);

  const addTxToBlock = useCallback((tx: Transaction) => {
    if (!tx) return;
    setCurrentBlock(prev => ({
      ...prev,
      transactions: [...prev.transactions, tx],
      fees: prev.fees + tx.fee,
    }));
    notify("TxAdded", { tx });
  }, [notify, setCurrentBlock]);

  return { finalizeBlock, addTxToBlock };
};