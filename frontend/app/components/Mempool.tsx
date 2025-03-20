import { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";

import { useSound } from "../context/Sound";
import { playTxClicked } from "./utils/sounds";
import { Transaction, newTransaction } from "../types/Transaction";
import { useGameState } from "../context/GameState";
import { useUpgrades } from "../context/Upgrades";

export type MempoolProps = {
  switchPage: (page: string) => void;
};

export const Mempool: React.FC<MempoolProps> = (props) => {
  const { upgrades, isUpgradeActive } = useUpgrades();
  const { gameState, upgradableGameState, addTxToBlock } = useGameState();
  const minTransactions = 6;
  const [transactions, setTransactions] = useState<Array<Transaction>>([]);
  const { isSoundOn } = useSound();


  // Auto-generate Transactions
  useEffect(() => {
    if (transactions.length < minTransactions) {
      const newTransactions = [...transactions];
      while (newTransactions.length < minTransactions) {
        newTransactions.push(newTransaction(isUpgradeActive, upgradableGameState.mevScaling));
      }

      setTransactions(isUpgradeActive(0) ? newTransactions.sort((a, b) => b.fee - a.fee) : newTransactions);
    }
  }, [transactions, upgrades]);

  const clickTx = (tx: Transaction, index: number) => {
    playTxClicked(isSoundOn);
    addTxToBlock(tx);

    const newTransactions = [...transactions];
    newTransactions.splice(index, 1);
    setTransactions(newTransactions);

    if (gameState.chains[0].currentBlock.transactions.length + 1 >= gameState.chains[0].currentBlock.maxSize) {
      props.switchPage("Mining");
    }
  }

  // Auto-clicker functionality
  useEffect(() => {
    if (!upgradableGameState.sequencerSpeed) return;
    const interval = setInterval(() => {
      if (transactions.length > 0) {
        clickTx(transactions[0], 0);
      }
    }, 1000 / upgradableGameState.sequencerSpeed);
    return () => clearInterval(interval);
  }, [transactions, upgradableGameState.sequencerSpeed]);

  return (
    <View className="flex flex-col mt-[10%] w-[80%] mx-auto bg-[#f7f7f740] rounded-xl h-content">
      <Text className="text-[#f7f7f7] text-2xl text-center m-2">Mempool</Text>
      <ScrollView className="">
        {transactions.map((transaction, index) => (
          <TouchableOpacity
            key={index}
            className="flex flex-row justify-between my-2 p-2 rounded-xl h-[4.2rem] w-[95%] mx-auto"
            style={transaction.style}
            onPress={() => clickTx(transaction, index)}
          >
            <View className="flex flex-col">
              <Text className="text-[#171717] text-xl">{transaction.type} ₿{transaction.amount.toFixed(2)}</Text>
              <View className="flex flex-row flex-1 gap-2">
                <Text className="text-[#171717] text-xl w-[30%] truncate">{transaction.from}</Text>
                <Text className="text-[#171717] text-xl">→</Text>
                <Text className="text-[#171717] text-xl w-[30%] truncate">{transaction.to}</Text>
              </View>
            </View>
            <View className="flex flex-col justify-between">
              <Text className="text-[#171717] text-2xl text-center font-bold">Fee</Text>
              <Text className="text-[#171717] text-xl font-bold">₿ {transaction.fee.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Mempool;
