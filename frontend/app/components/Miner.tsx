import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { playMineClicked, playBlockMined } from "../components/utils/sounds";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";

export const Miner: React.FC = () => {
  const [mineCounter, setMineCounter] = useState(0);
  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeBlock } = useGameState();
  const { isSoundOn } = useSound();

  const tryMineBlock = () => {
    playMineClicked(isSoundOn);
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    notify("TryMineBlock", {
      mineCounter: newMineCounter,
      isMined: newMineCounter >= gameState.chains[0].currentBlock.hp,
    });

    if (newMineCounter >= gameState.chains[0].currentBlock.hp) {
      finalizeBlock();
      playBlockMined(isSoundOn);
    }
  };

  // Try mine every (minerSpeed) milliseconds if the auto-miner is enabled
  const [shouldAutoMine, setShouldAutoMine] = useState(false);
  useEffect(() => {
    const newShouldAutoMine = upgradableGameState.minerSpeed > 0 && mineCounter < gameState.chains[0].currentBlock.hp;
    setShouldAutoMine(newShouldAutoMine);
  }, [upgradableGameState.minerSpeed, mineCounter, gameState.chains[0].currentBlock.hp]);
  useAutoClicker(
    shouldAutoMine,
    1000 / upgradableGameState.minerSpeed,
    tryMineBlock
  );

  return (
    <View className="flex flex-col bg-[#272727b0] h-full aspect-square rounded-xl relative">
      <View
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#ff6727] opacity-50 aspect-square rounded-full"
        style={{ width: `${Math.floor(mineCounter / gameState.chains[0].currentBlock.hp * 100)}%`, height: `${Math.floor(mineCounter / gameState.chains[0].currentBlock.hp * 100)}%` }}
      />
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#a7a7a7c0] rounded-full flex items-center justify-center
                  border-2 border-[#c7c7f780]"
        onPress={tryMineBlock}
      >
        <Text className="text-[#171717] text-6xl m-4 mx-10">⛏️</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Miner;
