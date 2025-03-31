import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { playMineClicked, playBlockMined } from "../components/utils/sounds";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";

type MinerProps = {
  switchPage: (page: string) => void;
};

export const Miner: React.FC<MinerProps> = (props) => {
  // const [nonce, setNonce] = useState(0);
  // TODO: mineCounter = upgradableGameState.difficulty - gameState.chains[0].currentBlock.hp
  const [mineCounter, setMineCounter] = useState(0);
  // const [blockHash, setBlockHash] = useState("");

  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeBlock } = useGameState();
  const { isSoundOn } = useSound();



  // Try mine every (minerSpeed) milliseconds if the auto-miner is enabled
  const shouldMine =
  upgradableGameState.minerSpeed > 0 &&
  mineCounter < gameState.chains[0].currentBlock.hp &&
  gameState.chains[0].currentBlock.transactions.length === gameState.chains[0].currentBlock.maxSize;

  const tryMineBlock = useCallback(() => {
    playMineClicked(isSoundOn);
    setMineCounter(prev => {
      const newMineCounter = prev + 1;

      if (newMineCounter >= gameState.chains[0].currentBlock.hp) {
        // This defers the call to the next event loop tick
        setTimeout(() => {
          notify("TryMineBlock", {
            mineCounter: newMineCounter,
            isMined: true,
          });
          finalizeBlock();
          playBlockMined(isSoundOn);
          props.switchPage("SequencingPage");
        }, 0);
      }
      return newMineCounter;
    });
  }, [gameState.chains, upgradableGameState.difficulty, finalizeBlock, isSoundOn]);

  useAutoClicker(shouldMine, 1000 / upgradableGameState.minerSpeed, tryMineBlock);

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
