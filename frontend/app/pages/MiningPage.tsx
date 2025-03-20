import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { playMineClicked } from "../components/utils/sounds";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";

type MiningPageProps = {
  switchPage: (page: string) => void;
};

export const MiningPage: React.FC<MiningPageProps> = (props) => {
  const [nonce, setNonce] = useState(0);
  // TODO: mineCounter = upgradableGameState.difficulty - gameState.chains[0].currentBlock.hp
  const [mineCounter, setMineCounter] = useState(0);
  const [blockHash, setBlockHash] = useState("");

  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeBlock } = useGameState();
  const { isSoundOn } = useSound();

  const tryMineBlock = () => {
    playMineClicked(isSoundOn);
    const randomNonce = Math.floor(Math.random() * 10000);
    setNonce(randomNonce);
    let newBlockHash = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    if (newMineCounter >= gameState.chains[0].currentBlock.hp) {
      newBlockHash = "0".repeat(upgradableGameState.difficulty) + newBlockHash.substring(upgradableGameState.difficulty);
    }
    setBlockHash(newBlockHash);
    notify("TryMineBlock", {
      nonce: randomNonce,
      blockHash: newBlockHash,
      mineCounter: newMineCounter,
      isMined: newMineCounter >= gameState.chains[0].currentBlock.hp,
    });

    if (newMineCounter >= gameState.chains[0].currentBlock.hp) {
      finalizeBlock();
      props.switchPage("SequencingPage");
    }
  };

  // Try mine every (minerSpeed) milliseconds if the auto-miner is enabled
  useEffect(() => {
    if (upgradableGameState.minerSpeed === 0) return; // Auto-miner is disabled
    const interval = setInterval(() => {
      if (mineCounter < gameState.chains[0].currentBlock.hp) {
        tryMineBlock();
      } else {
        clearInterval(interval);
      }
    }, 1000 / upgradableGameState.minerSpeed);
    return () => clearInterval(interval);
  }, [upgradableGameState.minerSpeed, mineCounter, gameState.chains[0].currentBlock.hp]);

  return (
    <View className="flex-1 flex flex-col items-center mt-[30%]">
      <View className="bg-[#f7f7f740] w-[80%] aspect-square rounded-xl border-2 border-[#f7f7f740] relative">
        <View
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#ff6727] opacity-50 aspect-square rounded-full"
          style={{ width: `${Math.floor(mineCounter / gameState.chains[0].currentBlock.hp * 100)}%`, height: `${Math.floor(mineCounter / gameState.chains[0].currentBlock.hp * 100)}%` }}
        />
        <TouchableOpacity
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#f7f7f7] rounded-full flex items-center justify-center
                    border-2 border-[#17f717]"
          onPress={tryMineBlock}
        >
          <Text className="text-[#171717] text-6xl m-4 mx-10">Mine!</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-[#f7f7f7] text-2xl mt-4">Difficulty {gameState.chains[0].currentBlock.hp}</Text>
      <Text className="text-[#f7f7f7] text-2xl">Nonce {nonce}</Text>
      <Text className="text-[#f7f7f7] text-2xl">Hash {blockHash}</Text>
      <Text className="text-[#f7f7f7] text-2xl mt-8">Reward ₿ {gameState.chains[0].currentBlock.reward}</Text>
      <Text className="text-[#f7f7f7] text-2xl">Fees ₿ {gameState.chains[0].currentBlock.fees.toFixed(2)}</Text>
    </View>
  );
};

export default MiningPage;
