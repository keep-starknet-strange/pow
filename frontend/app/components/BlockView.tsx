import { View, Text } from "react-native";
import { Block } from "../types/Block";

export type BlockViewProps = {
  block: Block;
  hideStats?: boolean;
};

export const BlockView: React.FC<BlockViewProps> = (props) => {
  return (
    <View className="flex flex-row justify-center relative mt-[0%]">
      <View className="bg-[#f7f7f740] w-[30%] aspect-square rounded-xl border-2 border-[#f7f7f740] relative">
        <View className="flex flex-wrap w-full aspect-square gap-1">
          {props.block.transactions.map((tx, index) => (
            <View 
              key={index} 
              className="rounded-xl w-[9.75%] aspect-square"
              style={tx.style}
            />
          ))}
        </View>
        {!props.hideStats && (
          <View className="absolute top-0 right-0 transform translate-x-[calc(100%)] translate-y-[50%]">
            <Text className="text-[#f7f7f7] text-xl">Reward {props.block.reward} BTC</Text>
            <Text className="text-[#f7f7f7] text-xl">Fees {props.block.fees.toFixed(2)} BTC</Text>
          </View>
        )}
        <Text className="text-[#f7f7f7] text-2xl absolute bottom-[-2rem] left-0 text-center w-full">
          Block {props.block.id}
        </Text>
      </View>
    </View>
  );
};

export default BlockView;
