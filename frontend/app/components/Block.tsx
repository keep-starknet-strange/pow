import { View, Text } from "react-native";
import { Transaction } from "../types";

type BlockProps = {
  blockNumber: number;
  blockReward: number;
  blockFees: number;
  blockTransactions: Transaction[];
  maxBlockTransactions: number;
};

const Block: React.FC<BlockProps> = ({
  blockNumber,
  blockReward,
  blockFees,
  blockTransactions,
  maxBlockTransactions,
}) => {
  return (
    <View className="flex flex-row justify-center relative mt-[0%]">
      <View className="bg-[#f7f7f740] w-[30%] aspect-square rounded-xl border-2 border-[#f7f7f740] relative">
        <View className="flex flex-wrap gap-1 w-full">
          {blockTransactions.map((_, index) => (
            <View key={index} className="bg-[#f7f7f7] rounded-xl w-[10%] aspect-square"></View>
          ))}
        </View>
        <View className="absolute top-0 right-0 transform translate-x-[calc(110%)] translate-y-[50%]">
          <Text className="text-[#f7f7f7] text-xl">Reward {blockReward} BTC</Text>
          <Text className="text-[#f7f7f7] text-xl">Fees {blockFees.toFixed(2)} BTC</Text>
        </View>
        <Text className="text-[#f7f7f7] text-2xl absolute bottom-[-2rem] left-0 text-center w-full">
          Block {blockNumber}
        </Text>
      </View>
    </View>
  );
};

export default Block;
