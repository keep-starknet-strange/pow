import { useEffect, useState, useCallback } from "react";
import { Transaction } from "../types/Transaction";
import { newTransaction } from "../utils/transactions";
import { useUpgrades } from "../context/Upgrades";
import { useGameState } from "../context/GameState";

export const useMempoolTransactions = () => {
  const minTransactions = 10;
  const refillInterval = 2000; // 2 seconds

  const { isUpgradeActive } = useUpgrades();
  const { upgradableGameState, gameState, addTxToBlock } = useGameState();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const refillTransactions = useCallback(() => {
    setTransactions((prevTransactions) => {
      if (prevTransactions.length >= minTransactions) return prevTransactions;

      const updatedTxs = [...prevTransactions];
      while (updatedTxs.length < minTransactions) {
        updatedTxs.push(newTransaction(isUpgradeActive, upgradableGameState.mevScaling));
      }

      return isUpgradeActive(0)
        ? updatedTxs.sort((a, b) => b.fee - a.fee)
        : updatedTxs;
    });
  }, [isUpgradeActive, upgradableGameState.mevScaling]);

  // Initial refill and periodic checks
  useEffect(() => {
    refillTransactions(); // immediate initial refill
    const intervalId = setInterval(refillTransactions, refillInterval); // periodic refill
    return () => clearInterval(intervalId);
  }, [refillTransactions, refillInterval]);

  const addTransactionToBlock = useCallback((tx: Transaction, index: number) => {
    if (
      gameState.chains[0].currentBlock.transactions.length >=
      gameState.chains[0].currentBlock.maxSize
    )
      return;

    addTxToBlock(tx);
    setTransactions((prev) => prev.filter((_, idx) => idx !== index));

    // Immediately refill if dropped below minTransactions
    setTimeout(refillTransactions, 0);
  }, [gameState.chains, addTxToBlock, refillTransactions]);

  return {
    transactions,
    setTransactions,
    addTransactionToBlock,
  };
};
