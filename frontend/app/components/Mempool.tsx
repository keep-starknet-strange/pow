import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Transaction } from "../types";

type MempoolProps = {
  transactions: Transaction[];
  addTxToBlock: (tx: Transaction, idx: number) => void;
};

const Mempool: React.FC<MempoolProps> = ({ transactions, addTxToBlock }) => {
  return (
    <View className="flex flex-col mt-[10%] w-[80%] mx-auto bg-[#f7f7f740] rounded-xl h-[55vh]">
      <Text className="text-[#f7f7f7] text-2xl text-center m-2">Mempool</Text>
      <ScrollView className="flex-1">
        {transactions.map((transaction, index) => (
          <TouchableOpacity
            key={index}
            className="flex flex-row justify-between my-2 p-2 bg-[#f7f7f7] rounded-xl h-[4.2rem] w-[95%] mx-auto"
            onPress={() => addTxToBlock(transaction, index)}
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
