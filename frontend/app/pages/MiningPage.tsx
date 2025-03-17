import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useSound } from "../context/Sound";
import { playMineClicked } from "../components/utils/sounds";
import { Block } from "../types/Block";

type MiningPageProps = {
  block: Block;
  finalizeBlock: () => void;
};

export const MiningPage: React.FC<MiningPageProps> = (props) => {
  // TODO: Change mining mechanic to be always the same # of clicks & show mining animation
  const [difficulty, setDifficulty] = useState(8);
  const [nonce, setNonce] = useState(0);
  const [mineCounter, setMineCounter] = useState(0);
  const [blockHash, setBlockHash] = useState("");
  const { isSoundOn } = useSound();

  const tryMineBlock = () => {
    playMineClicked(isSoundOn);
    const randomNonce = Math.floor(Math.random() * 10000);
    setNonce(randomNonce);
    let newBlockHash = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    if (newMineCounter >= difficulty) {
      newBlockHash = "0".repeat(difficulty) + newBlockHash.substring(difficulty);
    }
    setBlockHash(newBlockHash);

    if (newMineCounter >= difficulty) {
      props.finalizeBlock();
    }
  };

  // Try mine every (minerSpeed) milliseconds if the auto-miner is enabled
  const [hasAutoMineUpgrade, setHasAutoMineUpgrade] = useState(true);
  const [minerSpeed, setMinerSpeed] = useState(500);
  useEffect(() => {
    if (!hasAutoMineUpgrade) return;
    const interval = setInterval(() => {
      if (mineCounter < difficulty) {
        tryMineBlock();
      } else {
        clearInterval(interval);
      }
    }, minerSpeed);
    return () => clearInterval(interval);
  }, [hasAutoMineUpgrade, mineCounter, difficulty, minerSpeed]);

  return (
    <View className="flex-1 flex flex-col items-center mt-[30%]">
      <View className="bg-[#f7f7f740] w-[80%] aspect-square rounded-xl border-2 border-[#f7f7f740] relative">
        <View
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#ff6727] opacity-50 aspect-square rounded-full"
          style={{ width: `${Math.floor(mineCounter / difficulty * 100)}%`, height: `${Math.floor(mineCounter / difficulty * 100)}%` }}
        />
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
