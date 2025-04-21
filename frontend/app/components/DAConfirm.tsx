import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { playMineClicked, playBlockMined } from "../components/utils/sounds";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";
import { createTx } from "../utils/transactions";

import L2Blob from "../../assets/images/transaction/l2Blob.png";

type DAConfirmProps = {
  _id: string;
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
      const txIcon = L2Blob;
      const newTx = createTx(1, 1, txFee, txIcon);
      finalizeL2DA();
      addTxToBlock(newTx);
      playBlockMined(isSoundOn);
    }
  };

  const [shouldAutoConfirm, setShouldAutoConfirm] = useState(false);
  useEffect(() => {
    const newShouldAutoConfirm = upgradableGameState.daSpeed > 0 && mineCounter < (gameState.l2?.da.hp || 0);
    setShouldAutoConfirm(newShouldAutoConfirm);
  }, [upgradableGameState.daSpeed, mineCounter, gameState.l2?.da.hp]);

  useAutoClicker(
    shouldAutoConfirm,
    1000 / upgradableGameState.daSpeed,
    tryConfirmBlock
  );

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
