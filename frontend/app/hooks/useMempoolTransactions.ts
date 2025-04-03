import { useEffect, useState } from "react";
import { Transaction} from "../types/Transaction";
import { newTransaction } from "../utils/transactions";
import { useUpgrades } from "../context/Upgrades";
import { useGameState } from "../context/GameState";

export const useMempoolTransactions = () => {
  const minTransactions = 10;
  const { upgrades, isUpgradeActive } = useUpgrades();
  const { upgradableGameState, gameState, addTxToBlock } = useGameState();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (transactions.length < minTransactions) {
      // doesn't removes last 4 transactions to keep stale transactions out of the mempool
      setTransactions(prev => {
        const numToAdd = minTransactions - prev.length;
        const newTxs: Transaction[] = [];

        for (let i = 0; i < numToAdd; i++) {
          newTxs.push(newTransaction(isUpgradeActive, upgradableGameState.mevScaling));
        }
        const combined = [...prev, ...newTxs];
        // only sort if necessary
        const sortedTxs = isUpgradeActive(0)
          ? combined.sort((a, b) => b.fee - a.fee)
          : combined;

        return sortedTxs;
      });
    }
  }, [transactions, upgrades]);

  const addTransactionToBlock = (tx: Transaction, index: number) => {
    if (
      gameState.chains[0].currentBlock.transactions.length >=
      gameState.chains[0].currentBlock.maxSize
    )
      return;

    addTxToBlock(tx);
    const updatedTxs = [...transactions];
    updatedTxs.splice(index, 1);
    setTransactions(updatedTxs);
  };

  return {
    transactions,
    setTransactions,
    addTransactionToBlock,
  };
};
