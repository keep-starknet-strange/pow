import { useState, useEffect } from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";
import { createTx } from "../utils/transactions";
import automationJson from "../configs/automation.json";

import L2Blob from "../../assets/images/transaction/l2Blob.png";

import * as daImages from "../configs/da";
export const getDaIcon = (daId: number) => {
  const images = Object.values(daImages);
  return images[daId] || images[0];
}

import * as daAnimation from "../configs/storing";
export const getDaAnimation = (progress: number) => {
  const animations = Object.values(daAnimation);
  const animationIndex = Math.floor(progress * animations.length);
  return animations[animationIndex] || animations[0];
}

export const DAConfirm: React.FC = (props) => {
  // const [nonce, setNonce] = useState(0);
  // TODO: mineCounter = upgradableGameState.difficulty - gameState.chains[0].currentBlock.hp
  const [mineCounter, setMineCounter] = useState(0);
  // const [blockHash, setBlockHash] = useState("");

  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeL2DA, addTxToBlock } = useGameState();
  const { playSoundEffect } = useSound();

  // TODO: Show load animation
  const tryConfirmBlock = () => {
    if (!gameState.l2) {
      return;
    }
    playSoundEffect("DaClicked");
    const randomNonce = Math.floor(Math.random() * 10000);
    // setNonce(randomNonce);
    // let newBlockHash = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    // if (newMineCounter >= gameState.chains[0].currentBlock.hp) {
    //   newBlockHash = "0".repeat(upgradableGameState.difficulty) + newBlockHash.substring(upgradableGameState.difficulty);
    // }
    // setBlockHash(newBlockHash);
    notify("TryDA", {
      // nonce: randomNonce,
      // blockHash: newBlockHash,
      mineCounter: newMineCounter,
      isMined: newMineCounter >= gameState.l2.da.hp
    });

    if (newMineCounter >= gameState.l2.da.hp) {
      const txFee = gameState.l2.da.blockFees;
      const txIcon = L2Blob;
      const newTx = createTx(1, 1, txFee, txIcon);
      finalizeL2DA();
      addTxToBlock(newTx);
      playSoundEffect("DaDone");
    }
  };

  const [shouldAutoConfirm, setShouldAutoConfirm] = useState(false);
  useEffect(() => {
    const newShouldAutoConfirm = upgradableGameState.daLevel > 0 && mineCounter < (gameState.l2?.da.hp || 0);
    setShouldAutoConfirm(newShouldAutoConfirm);
  }, [upgradableGameState.daLevel, mineCounter, gameState.l2?.da.hp]);

  useAutoClicker(
    shouldAutoConfirm,
    1000 / (automationJson.L2[2].levels[upgradableGameState.daLevel]?.speed || 1),
    tryConfirmBlock
  );

  return (
    <View className="flex flex-col bg-[#27272740] h-full aspect-square rounded-xl relative">
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
        onPress={tryConfirmBlock}
      >
        <Image
          source={getDaIcon(upgradableGameState.daLevel)}
          className="w-28 h-28"
        />
      </TouchableOpacity>
      {mineCounter !== 0 && (
        <Image
          source={getDaAnimation(mineCounter / (gameState.l2?.da.hp || 1))}
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-full h-full pointer-events-none"
        />
      )}
    </View>
  );
};

export default DAConfirm;
