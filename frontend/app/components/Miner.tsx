import { useState, useEffect } from "react";
import { View, TouchableOpacity, Image } from "react-native";

import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";
import automationJson from "../configs/automation.json";

// TODO: Default ( non-CPU ) miner image
import * as minerImages from "../configs/miners";
export const getMinerImage = (minerId: number) => {
  const images = Object.values(minerImages);
  return images[minerId] || images[0];
}

import * as miningAnimation from "../configs/mining";
export const getMiningAnimation = (mineProgress: number) => {
  const animations = Object.values(miningAnimation);
  const animationIndex = Math.floor(animations.length * mineProgress);
  return animations[animationIndex] || animations[0];
}

export const Miner: React.FC = () => {
  const [mineCounter, setMineCounter] = useState(0);
  const { notify } = useEventManager();
  const { gameState, upgradableGameState, finalizeBlock } = useGameState();
  const { playSoundEffect } = useSound();

  const tryMineBlock = () => {
    playSoundEffect("MineClicked");
    const newMineCounter = mineCounter + 1;
    setMineCounter(newMineCounter);
    notify("TryMineBlock", {
      mineCounter: newMineCounter,
      isMined: newMineCounter >= gameState.chains[0].currentBlock.hp,
    });

    if (newMineCounter >= gameState.chains[0].currentBlock.hp) {
      finalizeBlock();
      playSoundEffect("BlockMined");
    }
  };

  // Try mine every (minerSpeed) milliseconds if the auto-miner is enabled
  const [shouldAutoMine, setShouldAutoMine] = useState(false);
  useEffect(() => {
    // TODO: Hardcoded miner automation index
    const minerSpeed = automationJson.L1[0].levels[upgradableGameState.minerLevel]?.speed;
    if (!minerSpeed) {
      setShouldAutoMine(false);
      return;
    }
    const newShouldAutoMine = minerSpeed > 0 && mineCounter < gameState.chains[0].currentBlock.hp;
    setShouldAutoMine(newShouldAutoMine);
  }, [upgradableGameState.minerLevel, mineCounter, gameState.chains[0].currentBlock.hp]);
  useAutoClicker(
    shouldAutoMine,
    1000 / (automationJson.L1[0].levels[upgradableGameState.minerLevel]?.speed || 1),
    tryMineBlock
  );

  return (
    <View className="flex flex-col bg-[#27272740] h-full aspect-square rounded-xl relative">
      {mineCounter !== 0 && (
        <Image
          source={getMiningAnimation(mineCounter / gameState.chains[0].currentBlock.hp)}
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-full h-full"
        />
      )}
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
        onPress={tryMineBlock}
      >
        <Image
          source={getMinerImage(upgradableGameState.minerLevel)}
          className="w-28 h-28"
        />
      </TouchableOpacity>
    </View>
  );
};

export default Miner;
