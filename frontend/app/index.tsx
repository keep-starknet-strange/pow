import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import BalanceDisplay from "./components/BalanceDisplay";
import Block from "./components/Block";
import Mempool from "./components/Mempool";
import Mining from "./components/Mining";
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
        <Mining blockReward={blockReward} blockFees={blockFees} difficulty={difficulty} nonce={nonce} blockHash={blockHash} tryMineBlock={tryMineBlock} />
      )}
    </View>
  );
}
