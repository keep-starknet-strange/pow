import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  difficulty: number;
  nonce: number;
  blockHash: string;
  blockReward: number;
  blockFees: number;
  tryMineBlock: () => void;
};

const Mining: React.FC<Props> = ({
  difficulty,
  nonce,
  blockHash,
  blockReward,
  blockFees,
  tryMineBlock,
}) => {
  return (
    <View className="flex-1 flex flex-col items-center mt-[30%]">
      <View className="bg-[#f7f7f740] w-[80%] aspect-square rounded-xl border-2 border-[#f7f7f740] relative">
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
  );
};

export default Mining;
