import { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";

import { useSound } from "../context/Sound";
import { playTxClicked } from "./utils/sounds";
import { Block, addTxToBlock } from "../types/Block";
import { Transaction, newTransaction } from "../types/Transaction";
import { useEventManager } from "../context/EventManager";
import { Upgrades, getActiveUpgrades } from "../types/Upgrade";

export type MempoolProps = {
  block: Block;
  setBlock: (block: Block) => void;
  switchPage: (page: string) => void;
  upgrades: Upgrades;
  maxBlockTransactions: number;
};

export const Mempool: React.FC<MempoolProps> = (props) => {
  const minTransactions = 5;
  const [transactions, setTransactions] = useState<Array<Transaction>>([]);
  const { isSoundOn } = useSound();
  const activatedUpgrades = getActiveUpgrades(props.upgrades);

  const { notify } = useEventManager();

  // Auto-generate Transactions
  useEffect(() => {
    if (transactions.length < minTransactions) {
      const newTransactions = [...transactions];
      while (newTransactions.length < minTransactions) {
        newTransactions.push(newTransaction(activatedUpgrades)); // Uses upgrade-based filtering
      }

      setTransactions(activatedUpgrades["txSorting"] ? newTransactions.sort((a, b) => b.fee - a.fee) : newTransactions);
    }
  }, [transactions, activatedUpgrades]);

  const clickTx = (tx: Transaction, index: number) => {
    playTxClicked(isSoundOn);
    notify("TxAdded", { tx, index });
    props.setBlock(addTxToBlock(props.block, tx));

    const newTransactions = [...transactions];
    newTransactions.splice(index, 1);
    setTransactions(newTransactions);

    if (props.block.transactions.length + 1 >= props.maxBlockTransactions) {
      props.switchPage("Mining");
    }
  }

  // Click tx every (autoClickerSpeed) milliseconds if the auto-clicker upgrade is active
  const [hasAutoClickerUpgrade, setHasAutoClickerUpgrade] = useState(true);
  const [autoClickerSpeed, setAutoClickerSpeed] = useState(500);

  useEffect(() => {
    if (!hasAutoClickerUpgrade) return;
    const interval = setInterval(() => {
      if (transactions.length > 0) {
        clickTx(transactions[0], 0);
      }
    }, autoClickerSpeed);
    return () => clearInterval(interval);
  }, [transactions, autoClickerSpeed, hasAutoClickerUpgrade, props.block]);

  return (
    <View className="flex flex-col mt-[10%] w-[80%] mx-auto bg-[#f7f7f740] rounded-xl h-[55vh]">
      <Text className="text-[#f7f7f7] text-2xl text-center m-2">Mempool</Text>
      <ScrollView className="flex-1">
        {transactions.map((transaction, index) => (
          <TouchableOpacity
            key={index}
            className="flex flex-row justify-between my-2 p-2 rounded-xl h-[4.2rem] w-[95%] mx-auto"
            style={transaction.style}
            onPress={() => clickTx(transaction, index)}
          >
            <View className="flex flex-col">
              <Text className="text-[#171717] text-xl">{transaction.type} {transaction.amount.toFixed(2)} BTC</Text>
              <View className="flex flex-row flex-1 gap-2">
                <Text className="text-[#171717] text-xl w-[30%] truncate">{transaction.from}</Text>
                <Text className="text-[#171717] text-xl">→</Text>
                <Text className="text-[#171717] text-xl w-[30%] truncate">{transaction.to}</Text>
              </View>
            </View>
            <View className="flex flex-col justify-between">
              <Text className="text-[#171717] text-2xl text-center">Fee</Text>
              <Text className="text-[#171717] text-xl">{transaction.fee.toFixed(2)} BTC</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Mempool;
