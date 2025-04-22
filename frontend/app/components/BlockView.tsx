import { View, Text, Image } from "react-native";
import { Block } from "../types/Block";
import messagesJson from "../configs/messages.json";
import { useGameState } from "../context/GameState";

export type BlockViewProps = {
  block: Block;
  showOverlay?: boolean;
  incompleted?: boolean;
};

export const BlockView: React.FC<BlockViewProps> = (props) => {
  const { upgradableGameState } = useGameState();
  const txWidth: number = 100 / Math.sqrt(props.block.maxSize);
  // TODO: Overlay #s to constant size/length/digits
  return (
    <View className="w-full h-full flex flex-col items-center justify-center">
      <View className="flex-1 bg-[#f7f7f740] aspect-square rounded-xl border-2 border-[#f7f7f740] relative overflow-hidden">
        <View className="flex flex-wrap w-full aspect-square"> 
          {props.block.transactions.map((tx, index) => (
            <View
              key={index}
              className="w-[9.75%] aspect-square border-2 border-[#00000020] rounded-lg overflow-hidden"
              style={{ width: `${txWidth}%`, ...tx.style }}
            >
              {tx.image && (
                <Image className="w-full h-full flex flex-col items-center justify-center rounded-lg" source={ tx.image } />
              )}
            </View>
          ))}
        </View>
        {props.block.id === 0 && (
        <Text className="absolute top-0 left-0 w-full h-full text-center
          text-xl text-[#ffffff] font-bold items-center justify-center py-4
        ">
          {messagesJson.genesis[upgradableGameState.prestige]}
        </Text>
        )}
        {props.showOverlay ? (
          <View
            className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-between"
            style={{
              backgroundColor: !props.incompleted ? "#00000080" : "#00000000",
            }}
          >
            <View/>
            <Text className="text-[#e9e9e9f0] text-4xl font-bold m-1">
              {!props.incompleted ? `#${props.block.id}` : ``}
            </Text>
            <View className="flex flex-col items-end justify-between w-[95%]">
              <Text className="text-[#e9e9e9f0] text-xl font-bold">🔲₿{props.block.reward.toFixed(0)}</Text>
              <Text className="text-[#e9e9e9f0] text-xl font-bold">💰₿{props.block.fees.toFixed(0)}</Text>
            </View>
          </View>
        ) : (
          <View className="absolute bottom-0 w-full flex flex-row justify-end">
            <View className="bg-[#272727b0] rounded-tl-lg rounded-br-lg p-[4px]">
            <Text className="text-[#e9e9e9f0] text-2xl font-bold">🔲 ₿{props.block.reward.toFixed(2)}</Text>
            <Text className="text-[#e9e9e9f0] text-2xl font-bold">💰 ₿{props.block.fees.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default BlockView;
