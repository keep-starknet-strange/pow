import { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";

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
  const minTransactions = 20;
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

  const [last10TransactionsTimes, setLast10TransactionsTimes] = useState<Array<number>>([]);
  const [tps, setTps] = useState<number>(0);
  const clickTx = (tx: Transaction, index: number) => {
    if (gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize) return;
    const playPitch = tx.fee + 1;
    playTxClicked(isSoundOn, playPitch);
    addTxToBlock(tx);

    const newTransactions = [...transactions];
    newTransactions.splice(index, 1);
    setTransactions(newTransactions);

    const newTimes = [...last10TransactionsTimes];
    newTimes.push(Date.now());
    if (newTimes.length > 10) newTimes.shift();
    setLast10TransactionsTimes(newTimes);

    const timeDiff = newTimes[newTimes.length - 1] - newTimes[0];
    const newTps = (newTimes.length - 1) / (timeDiff / 1000);
    if (isNaN(newTps)) setTps(0);
    else setTps(newTps);
  }
  const clickTxs = (numberOfClicks: number) => {
    if (gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize) return;
    const newTransactions = [...transactions];
    for (let i = 0; i < numberOfClicks; i++) {
      const tx = newTransactions[i];
      addTxToBlock(tx);
      if (tx === undefined) continue;
      const playPitch = tx.fee + 1;
      playTxClicked(isSoundOn, playPitch);
    }
    newTransactions.splice(0, numberOfClicks);
    setTransactions(newTransactions);

    const newTimes = [...last10TransactionsTimes];
    for (let i = 0; i < numberOfClicks; i++) {
      newTimes.push(Date.now());
    }
    if (newTimes.length > 10) newTimes.splice(0, numberOfClicks);
    setLast10TransactionsTimes(newTimes);

    const timeDiff = newTimes[newTimes.length - 1] - newTimes[0];
    const newTps = (newTimes.length - 1) / (timeDiff / 1000);
    if (isNaN(newTps)) setTps(0);
    else setTps(newTps);
  }
  // Recalculate TPS every second
  useEffect(() => {
    const interval = setInterval(() => {
       // Remove txs older than 5 seconds
      const newTimes = last10TransactionsTimes.filter(time => Date.now() - time < 5000);
      setLast10TransactionsTimes(newTimes);
      const timeDiff = newTimes[newTimes.length - 1] - newTimes[0];
      const newTps = (newTimes.length - 1) / (timeDiff / 1000);

      if (isNaN(newTps)) setTps(0);
      else setTps(newTps);
    }, 1000);
    return () => clearInterval(interval);
  }, [last10TransactionsTimes]);

  // Auto-clicker functionality
  const updateInterval = 500;
  useEffect(() => {
    if (!upgradableGameState.sequencerSpeed) return;
    const interval = setInterval(() => {
      if (transactions.length > 0) {
        // upgradableGameState.sequencerSpeed = expected TPS
        const numberOfClicks = Math.floor(updateInterval / upgradableGameState.sequencerSpeed);
        clickTxs(numberOfClicks);
      }
    }, updateInterval);
    return () => clearInterval(interval);
  }, [transactions, upgradableGameState.sequencerSpeed]);

  return (
    <View className="flex flex-col w-full bg-[#f7f7f740] rounded-xl border-2 border-[#f7f7f740]">
      <View className="flex flex-row justify-between m-1 mx-4">
        <Text className="text-[#f7f7f7] text-2xl font-bold">Mempool</Text>
        <Text className="text-[#f7f7f7] text-2xl">{tps.toFixed(2)} TPS</Text>
      </View>
      <ScrollView className="mb-1 h-[12rem]">
        {transactions.map((transaction, index) => (
          <TouchableOpacity
            key={index}
            className="flex flex-row justify-between my-1 p-2 rounded-xl h-[4.2rem] w-[95%] mx-auto"
            style={transaction.style}
            onPress={() => clickTx(transaction, index)}
          >
            <View className="flex flex-row">
              <View className="flex flex-col w-[70%]">
                <Text className="text-[#171717] text-xl">{transaction.type} ₿{transaction.amount.toFixed(2)}</Text>
                <View className="flex flex-row flex-1 gap-2">
                  <Text className="text-[#171717] text-xl w-[40%] truncate">{transaction.from}</Text>
                  <Text className="text-[#171717] text-xl">→</Text>
                  <Text className="text-[#171717] text-xl w-[40%] truncate">{transaction.to}</Text>
                </View>
              </View>
              <View className="flex flex-col justify-between">
                {transaction.image && <Image source={{uri: transaction.image}} style={{ width: 40, height: 40 }} />}
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
