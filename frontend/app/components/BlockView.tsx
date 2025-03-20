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
          <View className="absolute top-0 right-0 transform translate-x-[calc(100%)] translate-y-[10%] pl-2">
            <View className="flex flex-row justify-between items-center w-full">
              <Text className="text-[#f7f7f7] text-xl">Block</Text>
              <Text className="text-[#f7f7f7] text-xl">₿ {props.block.reward.toFixed(2)}</Text>
            </View>
            <View className="flex flex-row justify-between items-center w-full">
              <Text className="text-[#f7f7f7] text-xl">Fees</Text>
              <Text className="text-[#f7f7f7] text-xl">₿ {props.block.fees.toFixed(2)}</Text>
            </View>
            <View className="h-[1px] bg-[#f7f7f740] w-full my-1" />
            <Text className="text-[#f7f7f7] text-xl text-center">Reward</Text>
            <Text className="text-[#f7f7f7] text-2xl font-bold text-center">₿ {(props.block.reward + props.block.fees).toFixed(2)}</Text>
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
