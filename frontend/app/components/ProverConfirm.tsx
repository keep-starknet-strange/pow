import { useState, useEffect } from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";
import { createTx } from "../utils/transactions";
import automationsJson from "../configs/automation.json";

import l2Batch from "../../assets/images/transaction/l2Batch.png";

import * as proverImages from "../configs/provers";
export const getProverImage = (proverId: number) => {
  const images = Object.values(proverImages);
  return images[proverId] || images[0];
}

import * as ProvingAnimation from "../configs/proving";
export const getProvingAnimation = (progress: number) => {
  const animations = Object.values(ProvingAnimation);
  const animationIndex = Math.floor(progress * animations.length);
  return animations[animationIndex] || animations[0];
}

export const ProverConfirm: React.FC = (props) => {
  // const [nonce, setNonce] = useState(0);
  // TODO: mineCounter = upgradableGameState.difficulty - gameState.chains[0].currentBlock.hp
  const [mineCounter, setMineCounter] = useState(0);
  // const [blockHash, setBlockHash] = useState("");

  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeL2Proof, addTxToBlock } = useGameState();

  // TODO: Show load animation
  const tryProve = () => {
    if (!gameState.l2) {
      return;
    }
    const randomNonce = Math.floor(Math.random() * 10000);
    // setNonce(randomNonce);
    // let newBlockHash = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    // if (newMineCounter >= gameState.chains[0].currentBlock.hp) {
    //   newBlockHash = "0".repeat(upgradableGameState.difficulty) + newBlockHash.substring(upgradableGameState.difficulty);
    // }
    // setBlockHash(newBlockHash);
    notify("ProveClicked", {
      // nonce: randomNonce,
      // blockHash: newBlockHash,
      mineCounter: newMineCounter,
      isMined: newMineCounter >= gameState.l2.prover.hp
    });

    if (newMineCounter >= gameState.l2.prover.hp) {
      const txFee = gameState.l2.prover.blockFees;
      const txIcon = l2Batch;
      const newTx = createTx(1, 4, txFee, txIcon);
      finalizeL2Proof();
      addTxToBlock(newTx);
    }
  };

  const [shouldAutoProve, setShouldAutoProve] = useState(false);
  useEffect(() => {
    const newShouldAutoProve = upgradableGameState.proverLevel > 0 && mineCounter < (gameState.l2?.prover.hp || 0);
    setShouldAutoProve(newShouldAutoProve);
  }, [upgradableGameState.proverLevel, mineCounter, gameState.l2?.prover.hp]);

  useAutoClicker(
    shouldAutoProve,
    1000 / (automationsJson.L2[1].levels[upgradableGameState.proverLevel]?.speed || 1),
    tryProve
  );

  return (
    <View className="flex flex-col bg-[#27272740] h-full aspect-square rounded-xl relative">
      {mineCounter !== 0 && (
        <Image
          source={getProvingAnimation(mineCounter / (gameState.l2?.prover.hp || 1))}
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-full h-full pointer-events-none"
        />
      )}
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
        onPress={tryProve}
      >
        <Image
          source={getProverImage(upgradableGameState.proverLevel)}
          className="w-28 h-28"
        />
      </TouchableOpacity>
    </View>
  );
};

export default ProverConfirm;
