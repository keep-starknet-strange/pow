import { useEffect, useState } from "react";
import { Transaction} from "../types/Transaction";
import { newTransaction } from "../utils/transactions";
import { useUpgrades } from "../context/Upgrades";
import { useGameState } from "../context/GameState";
import { useCurrentBlock } from "../context/CurrentBlock";
import { useBlockActions } from "./useBlockActions";

export const useMempoolTransactions = () => {
  const minTransactions = 10;
  const { upgrades, isUpgradeActive } = useUpgrades();
  const { upgradableGameState, gameState } = useGameState();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { currentBlock } = useCurrentBlock();
  const { addTxToBlock } = useBlockActions();

  useEffect(() => {
    if (transactions.length < minTransactions) {
      // removes last 4 transactions to keep stale transactions out of the mempool
      const newTxs = [...transactions].slice(0, Math.max(0, transactions.length - 4));
      while (newTxs.length < minTransactions) {
        newTxs.push(newTransaction(isUpgradeActive, upgradableGameState.mevScaling));
      }
      setTransactions(prev => {
        let stableTxs = prev.slice(0, Math.max(0, transactions.length - 4)); // start with existing transactions
        const numToAdd = minTransactions - stableTxs.length;
      
        for (let i = 0; i < numToAdd; i++) {
          stableTxs.push(newTransaction(isUpgradeActive, upgradableGameState.mevScaling));
        }
      
        // only sort if necessary
        const sortedTxs = isUpgradeActive(0)
          ? [...stableTxs].sort((a, b) => b.fee - a.fee)
          : stableTxs;
      
        return sortedTxs;
      });
    }
  }, [transactions, upgrades]);

  const addTransactionToBlock = (tx: Transaction, index: number) => {
    if (
      currentBlock.transactions.length >=
      currentBlock.maxSize
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
