import { useState, useEffect } from "react";
import { View } from "react-native";
import BalanceDisplay from "./components/BalanceDisplay";
import Block from "./components/Block";
import Mempool from "./components/Mempool";
import Mining from "./components/Mining";
import "./global.css";

export default function Index() {
  const maxBlockTransactions = 8 * 8;

  // Grouped Block Data
  const [blockData, setBlockData] = useState({
    blockNumber: 0,
    blockReward: 5,
    blockFees: 0,
    blockTransactions: [] as any[],
  });

  // Grouped Mining Data
  const [miningData, setMiningData] = useState({
    difficulty: 1,
    nonce: 0,
    blockHash: "",
    miningMode: false,
  });

  // Grouped Mempool Data
  const defaultTransaction = {
    from: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    to: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    type: "Transfer",
    amount: 0.1,
    fee: 0.03,
  };
  const minTransactions = 20;
  const [transactions, setTransactions] = useState<Array<any>>([defaultTransaction]);

  // Reset Block Data
  const resetBlock = () => {
    setBlockData({ blockNumber: blockData.blockNumber, blockReward: 5, blockFees: 0, blockTransactions: [] });
    setMiningData({ ...miningData, difficulty: 1, nonce: 0, miningMode: false });
  };

  // Mining Function
  const tryMineBlock = () => {
    const newNonce = miningData.nonce + 1;
    const newBlockHash = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
    setMiningData({ ...miningData, nonce: newNonce, blockHash: newBlockHash });

    if (newBlockHash.startsWith("0".repeat(miningData.difficulty))) {
      finalizeBlock();
    }
  };

  // Finalize Mined Block
  const finalizeBlock = () => {
    setBlockData({
      ...blockData,
      blockNumber: blockData.blockNumber + 1,
      blockFees: blockData.blockFees,
    });
    resetBlock();
  };

  // Add Transaction to Block
  const addTxToBlock = (tx: any, idx: number) => {
    const newBlockTransactions = [...blockData.blockTransactions, tx];
    setBlockData({ ...blockData, blockTransactions: newBlockTransactions, blockFees: blockData.blockFees + tx.fee });

    if (newBlockTransactions.length >= maxBlockTransactions) {
      setMiningData({ ...miningData, miningMode: true });
    }

    // Remove from Mempool
    const newTransactions = transactions;
    newTransactions.splice(idx, 1);
    setTransactions([...newTransactions]);
  };

  // Auto-generate Transactions
  useEffect(() => {
    if (transactions.length < minTransactions) {
      const newTransactions = [...transactions];
      while (newTransactions.length < minTransactions) {
        let randTx = { ...defaultTransaction };
        randTx.from = Math.random().toString(36).substring(2, 15);
        randTx.to = Math.random().toString(36).substring(2, 15);
        randTx.amount = (Math.random() + 1) * 10;
        randTx.fee = (Math.random() + 1) * 0.1;
        newTransactions.push(randTx);
      }
      setTransactions(newTransactions);
    }
  }, [transactions]);

  const props = {
    balance: blockData.blockReward + blockData.blockFees,
    block: { ...blockData },
    mempool: { transactions, addTxToBlock },
    mining: { ...miningData, blockReward: blockData.blockReward, blockFees: blockData.blockFees, tryMineBlock },
  };

  return (
    <View className="flex-1 bg-[#171717]">
      <BalanceDisplay {...props} />
      {!miningData.miningMode ? (
        <View className="flex-1">
          <Block {...props.block} />
          <Mempool {...props.mempool} />
        </View>
      ) : (
        <Mining {...props.mining} />
      )}
    </View>
  );
}
