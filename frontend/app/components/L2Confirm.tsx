import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";
import automationJson from "../configs/automation.json";

import * as sequencerImages from "../configs/sequencers";
export const getSequencerImage = (sequencerId: number) => {
  const images = Object.values(sequencerImages);
  return images[sequencerId] || images[0];
}

import * as SequencingAnimation from "../configs/sequencing";
export const getSequencingAnimation = (progress: number) => {
  const animations = Object.values(SequencingAnimation);
  const animationIndex = Math.floor(progress * animations.length);
  return animations[animationIndex] || animations[0];
}


export const L2Confirm: React.FC = (props) => {
  const [mineCounter, setMineCounter] = useState(0);
  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeL2Block } = useGameState();
  const { playSoundEffect } = useSound();

  const tryConfirmBlock = () => {
    playSoundEffect("SequenceClicked");
    const randomNonce = Math.floor(Math.random() * 10000);
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    notify("TryConfirmBlock", {
      mineCounter: newMineCounter,
      isMined: newMineCounter >= gameState.chains[1].currentBlock.hp,
    });

    if (newMineCounter >= gameState.chains[1].currentBlock.hp) {
      finalizeL2Block();
      playSoundEffect("SequenceDone");
    }
  };

  // Try mine every (minerSpeed) milliseconds if the auto-miner is enabled
  const [shouldAutoConfirm, setShouldAutoConfirm] = useState(false);
  useEffect(() => {
    const newShouldAutoConfirm =
      upgradableGameState.sequencerLevel > 0 &&
      mineCounter < gameState.chains[1].currentBlock.hp;
    setShouldAutoConfirm(newShouldAutoConfirm);
  }, [upgradableGameState.sequencerLevel, mineCounter, gameState.chains[1].currentBlock.hp]);

  useAutoClicker(
    shouldAutoConfirm,
    1000 / (automationJson.L2[0].levels[upgradableGameState.sequencerLevel]?.speed || 1),
    tryConfirmBlock
  );

  return (
    <View className="flex flex-col bg-[#27272740] h-full aspect-square rounded-xl relative">
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
        onPress={tryConfirmBlock}
      >
        <Image
          source={getSequencerImage(upgradableGameState.sequencerLevel)}
          className="w-28 h-28"
        />
      </TouchableOpacity>
      {mineCounter !== 0 && (
        <Image
          source={getSequencingAnimation(mineCounter / gameState.chains[1].currentBlock.hp )}
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-full h-full pointer-events-none"
        />
      )}
    </View>
  );
};

export default L2Confirm;
