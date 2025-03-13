import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { playMineClicked } from "../components/utils/sounds";
import { Block } from "../types/Block";

type MiningPageProps = {
  block: Block;
  finalizeBlock: () => void;
};

export const MiningPage: React.FC<MiningPageProps> = (props) => {
  // TODO: Change mining mechanic to be always the same # of clicks & show mining animation
  const difficulty = 1;
  const [nonce, setNonce] = useState(0);
  const [blockHash, setBlockHash] = useState("");

  const tryMineBlock = () => {
    playMineClicked();
    const newNonce = nonce + 1;
    const newBlockHash = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
    setNonce(newNonce);
    setBlockHash(newBlockHash);

    if (newBlockHash.startsWith("0".repeat(difficulty))) {
      props.finalizeBlock();
    }
  };

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
      <Text className="text-[#f7f7f7] text-2xl mt-8">Reward {props.block.reward} BTC</Text>
      <Text className="text-[#f7f7f7] text-2xl">Fees {props.block.fees.toFixed(2)} BTC</Text>
    </View>
  );
};

export default MiningPage;
