import { useState, useEffect } from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import BalanceDisplay from "./components/BalanceDisplay";
import Block from "./components/Block";
import Mempool from "./components/Mempool";
import "./global.css";

export default function Index() {
  const maxBlockTransactions = 8*8;
  const [blockNumber, setBlockNumber] = useState(0);
  const [blockReward, setBlockReward] = useState(5);
  const [blockFees, setBlockFees] = useState(0);
  const [balance, setBalance] = useState(0);

  const [difficulty, setDifficulty] = useState(1);
  const [nonce, setNonce] = useState(0);
  const [blockHash, setBlockHash] = useState("");
  const [miningMode, setMiningMode] = useState(false);

  const [blockTransactions, setBlockTransactions] = useState<Array<any>>([]);
  const resetBlock = () => {
    setBlockReward(5);
    setBlockFees(0);
    setBlockTransactions([]);
    setDifficulty(1);
    setNonce(0);
  }
  const tryMineBlock = () => {
    const newNonce = nonce + 1;
    setNonce(newNonce);
    const newBlockHash = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
    setBlockHash(newBlockHash);
    if (newBlockHash.startsWith("0".repeat(difficulty))) {
      finalizeBlock();
    }
  }
  const finalizeBlock = () => {
    setBlockNumber(blockNumber + 1);
    setBalance(balance + blockReward + blockFees);
    resetBlock();
    setMiningMode(false);
  }
  const addTxToBlock = (tx: any, idx: number) => {
    const newBlockTransactions = [...blockTransactions];
    const newFees = blockFees + tx.fee;
    newBlockTransactions.push(tx);
    setBlockTransactions(newBlockTransactions);
    setBlockFees(newFees);
    if (newBlockTransactions.length >= maxBlockTransactions) {
      setMiningMode(true);
    }
    // Remove transaction from mempool
    const newTransactions = transactions;
    newTransactions.splice(idx, 1);
    setTransactions(newTransactions);
  }

  const defaultTransaction = {
    from: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    to: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    type: "Transfer",
    amount: 0.1,
    fee: 0.03,
  };
  const minTransactions = 20;
  const [transactions, setTransactions] = useState<Array<any>>([defaultTransaction]);
  useEffect(() => {
    if (transactions.length < minTransactions) {
      const newTransactions = [...transactions];
      while (newTransactions.length < minTransactions) {
        let randTx = { ...defaultTransaction };
        randTx.from = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        randTx.to = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        randTx.amount = (Math.random() + 1) * 10;
        randTx.fee = (Math.random() + 1)  * 0.1;
        newTransactions.push(randTx);
      }
      setTransactions(newTransactions);
    }
  }, [transactions, defaultTransaction, minTransactions]);

  return (
    <View className="flex-1 bg-[#171717]">
      <BalanceDisplay balance={balance} />
      {!miningMode && (
      <View className="flex-1">
      <Block blockNumber={blockNumber} blockReward={blockReward} blockFees={blockFees} blockTransactions={blockTransactions} maxBlockTransactions={maxBlockTransactions} />
      <Mempool transactions={transactions} addTxToBlock={addTxToBlock} />
      </View>
      )}
      {miningMode && (
        <View className="flex-1 flex flex-col items-center mt-[30%]">
          <View className="bg-[#f7f7f740] w-[80%] aspect-square rounded-xl border-2 border-[#f7f7f740] relative">
            <View className="flex flex-wrap gap-1 w-full m-[0.4rem]">
              {Array.from({ length: maxBlockTransactions }, (_, index) => (
                <View
                  key={index}
                  className="bg-[#f7f7f7a0] rounded-xl w-[11%] aspect-square"
                ></View>
              ))}
            </View>
            <TouchableOpacity
              className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#f7f7f7] rounded-full flex items-center justify-center
                         border-2 border-[#17f717]"
              onPress={tryMineBlock}
            >
              <Text className="text-[#171717] text-6xl m-4 mx-10">Mine!</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-[#f7f7f7] text-2xl mt-4">Difficulty {difficulty}</Text>
          <Text className="text-[#f7f7f7] text-2xl">Nonce {nonce}</Text>
          <Text className="text-[#f7f7f7] text-2xl">Hash {blockHash}</Text>
          <Text className="text-[#f7f7f7] text-2xl mt-8">Reward {blockReward} BTC</Text>
          <Text className="text-[#f7f7f7] text-2xl">Fees {blockFees.toFixed(2)} BTC</Text>
        </View>
      )}
    </View>
  );
}
