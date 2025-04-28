import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import { playSequenceClicked, playSequenceDone } from "../components/utils/sounds";

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

type L2ConfirmProps = {
  _id: number;
};

export const L2Confirm: React.FC<L2ConfirmProps> = (props) => {
  // const [nonce, setNonce] = useState(0);
  // TODO: mineCounter = upgradableGameState.difficulty - gameState.chains[0].currentBlock.hp
  const [mineCounter, setMineCounter] = useState(0);
  // const [blockHash, setBlockHash] = useState("");

  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeL2Block } = useGameState();
  const { isSoundOn } = useSound();

  const tryConfirmBlock = () => {
    playSequenceClicked(isSoundOn);
    const randomNonce = Math.floor(Math.random() * 10000);
    // setNonce(randomNonce);
    // let newBlockHash = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    // if (newMineCounter >= gameState.chains[0].currentBlock.hp) {
    //   newBlockHash = "0".repeat(upgradableGameState.difficulty) + newBlockHash.substring(upgradableGameState.difficulty);
    // }
    // setBlockHash(newBlockHash);
    notify("TryConfirmBlock", {
      // nonce: randomNonce,
      // blockHash: newBlockHash,
      mineCounter: newMineCounter,
      isMined: newMineCounter >= gameState.chains[1].currentBlock.hp,
    });

    if (newMineCounter >= gameState.chains[1].currentBlock.hp) {
      finalizeL2Block();
      playSequenceDone(isSoundOn);
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
