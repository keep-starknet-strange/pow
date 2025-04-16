import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { playMineClicked, playBlockMined } from "../components/utils/sounds";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";
import { createTx } from "../utils/transactions";

type DAConfirmProps = {
};

export const DAConfirm: React.FC<DAConfirmProps> = (props) => {
  // const [nonce, setNonce] = useState(0);
  // TODO: mineCounter = upgradableGameState.difficulty - gameState.chains[0].currentBlock.hp
  const [mineCounter, setMineCounter] = useState(0);
  // const [blockHash, setBlockHash] = useState("");

  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeL2DA, addTxToBlock } = useGameState();
  const { isSoundOn } = useSound();

  // TODO: Show load animation
  const tryConfirmBlock = () => {
    if (!gameState.l2) {
      return;
    }
    playMineClicked(isSoundOn);
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
      const txIcon = require("../../assets/images/transaction/l2Blob.png");
      const newTx = createTx({
        name: "L2",
        color: "#f760f7a0"
      }, txFee, txIcon);
      finalizeL2DA();
      addTxToBlock(newTx);
      playBlockMined(isSoundOn);
    }
  };

  return (
    <View className="flex flex-col bg-[#272727b0] h-full aspect-square rounded-xl relative">
      {gameState.l2 && (
        <>
        <View
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#ff6727] opacity-50 aspect-square rounded-full"
          style={{ width: `${Math.floor(mineCounter / gameState.l2.da.hp * 100)}%`, height: `${Math.floor(mineCounter / gameState.l2.da.hp * 100)}%` }}
        />
        <TouchableOpacity
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#a7a7a7c0] rounded-full flex items-center justify-center
                    border-2 border-[#c7c7f780]"
          onPress={tryConfirmBlock}
        >
          <Text className="text-[#171717] text-6xl m-4 mx-10">🆗</Text>
        </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default DAConfirm;
