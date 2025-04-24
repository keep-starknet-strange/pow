import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { playMineClicked, playBlockMined } from "../components/utils/sounds";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";


export const L2Confirm: React.FC = (props) => {
  const [mineCounter, setMineCounter] = useState(0);
  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeL2Block } = useGameState();
  const { isSoundOn } = useSound();

  const tryConfirmBlock = () => {
    playMineClicked(isSoundOn);
    const randomNonce = Math.floor(Math.random() * 10000);
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    notify("TryConfirmBlock", {
      mineCounter: newMineCounter,
      isMined: newMineCounter >= gameState.chains[1].currentBlock.hp,
    });

    if (newMineCounter >= gameState.chains[1].currentBlock.hp) {
      finalizeL2Block();
      playBlockMined(isSoundOn);
    }
  };

  // Try mine every (minerSpeed) milliseconds if the auto-miner is enabled
  const [shouldAutoConfirm, setShouldAutoConfirm] = useState(false);
  useEffect(() => {
    const newShouldAutoConfirm =
      upgradableGameState.sequencerSpeed > 0 &&
      mineCounter < gameState.chains[1].currentBlock.hp;
    setShouldAutoConfirm(newShouldAutoConfirm);
  }, [upgradableGameState.sequencerSpeed, mineCounter, gameState.chains[1].currentBlock.hp]);

  useAutoClicker(
    shouldAutoConfirm,
    1000 / upgradableGameState.sequencerSpeed,
    tryConfirmBlock
  );

  return (
    <View className="flex flex-col bg-[#272727b0] h-full aspect-square rounded-xl relative">
      <View
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#ff6727] opacity-50 aspect-square rounded-full"
        style={{ width: `${Math.floor(mineCounter / gameState.chains[1].currentBlock.hp * 100)}%`, height: `${Math.floor(mineCounter / gameState.chains[1].currentBlock.hp * 100)}%` }}
      />
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#a7a7a7c0] rounded-full flex items-center justify-center
                  border-2 border-[#c7c7f780]"
        onPress={tryConfirmBlock}
      >
        <Text className="text-[#171717] text-6xl m-4 mx-10">🆗</Text>
      </TouchableOpacity>
    </View>
  );
};

export default L2Confirm;
