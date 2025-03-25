import { useEffect, useState } from "react";
import { Transaction, newTransaction } from "../types/Transaction";
import { useUpgrades } from "../context/Upgrades";
import { useGameState } from "../context/GameState";

export const useMempoolTransactions = () => {
  const minTransactions = 10;
  const { upgrades, isUpgradeActive } = useUpgrades();
  const { upgradableGameState, gameState, addTxToBlock } = useGameState();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (transactions.length < minTransactions) {
      const newTxs = [...transactions];
      while (newTxs.length < minTransactions) {
        newTxs.push(newTransaction(isUpgradeActive, upgradableGameState.mevScaling));
      }
      setTransactions(
        isUpgradeActive(0) ? newTxs.sort((a, b) => b.fee - a.fee) : newTxs
      );
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
