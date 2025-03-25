import { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { useSound } from "../context/Sound";
import { playTxClicked } from "./utils/sounds";
import { useGameState } from "../context/GameState";
import { useMempoolTransactions } from "../hooks/useMempoolTransactions";
import { useAutoClicker } from "../hooks/useAutoClicker";

import { Transaction } from "../types/Transaction";

export type MempoolProps = {
  switchPage: (page: string) => void;
};

export const Mempool: React.FC<MempoolProps> = (props) => {
  const { gameState, upgradableGameState } = useGameState();
  const { isSoundOn } = useSound();
  const { transactions, addTransactionToBlock } = useMempoolTransactions();

  const blockFull = gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize;
  const containerStyle = {
    opacity: blockFull ? 0.5 : 1,
  };

  useAutoClicker(
    !!upgradableGameState.sequencerSpeed,
    1000 / upgradableGameState.sequencerSpeed,
    () => transactions.length > 0 && clickTx(transactions[0], 0)
  );

  const [last10TransactionsTimes, setLast10TransactionsTimes] = useState<Array<number>>([]);
  const [tps, setTps] = useState<number>(0);
  const clickTx = (tx: Transaction, index: number) => {
    if (gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize) return;
    const playPitch = tx.fee + 1;
    playTxClicked(isSoundOn, playPitch);
    addTransactionToBlock(tx, index);

    const newTimes = [...last10TransactionsTimes];
    newTimes.push(Date.now());
    if (newTimes.length > 10) newTimes.shift();
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

  return (
    <View 
      className="flex flex-col w-full bg-[#f7f7f740] rounded-xl border-2 border-[#f7f7f740]"
      style={containerStyle}
      pointerEvents={blockFull ? "none" : "auto"}
    >
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
                  <Text className="text-[#171717] text-xl w-[40%]">{transaction.meta1}</Text>
                  <Text className="text-[#171717] text-xl">→</Text>
                  <Text className="text-[#171717] text-xl w-[40%]" >{transaction.meta2}</Text>
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
