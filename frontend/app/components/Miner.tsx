import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useUpgrades } from "../context/Upgrades";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";
import { getAutomationIcon } from "../utils/upgrades";

import * as miningAnimation from "../configs/mining";
export const getMiningAnimation = (mineProgress: number) => {
  const animations = Object.values(miningAnimation);
  const animationIndex = Math.floor(animations.length * mineProgress);
  return animations[animationIndex] || animations[0];
};

export const Miner: React.FC = () => {
  const { automations, getUpgradeValue } = useUpgrades();
  const { miningProgress, mineBlock } = useGame();

  const [mineStartTime, setMineStartTime] = useState(Date.now());
  const [mineHash, setMineHash] = useState("0xdEadBeefDeadBeEf");
  const [mineColor, setMineColor] = useState("#CA1F4B");
  const generateRandomHash = (isDone: boolean) => {
    const difficulty = getUpgradeValue(0, "Block Difficulty");
    const randomPart = Math.floor(Math.random() * 0xffffffffff)
      .toString(14)
      .padStart(14, "0");
    // Replace first `difficulty` bytes with 00 if done
    return isDone
      ? `0x${"00".repeat(difficulty)}${randomPart}`
      : `0x${randomPart}`;
  };
  useEffect(() => {
    setMineHash(generateRandomHash(miningProgress === 1));
    setMineColor(miningProgress === 1 ? "#20DF20" : "#CA1F4B");
    setMineStartTime(Date.now());
  }, [miningProgress]);

  return (
    <View className="flex flex-col h-full aspect-square rounded-xl relative">
      <Confirmer
        progress={miningProgress}
        image={getAutomationIcon(0, "Miner", 0)}
        getAnimation={getMiningAnimation}
        onConfirm={mineBlock}
        renderedBy="miner"
        confirmPopup={{
          startTime: mineStartTime,
          value: mineHash,
          color: mineColor,
        }}
      />
    </View>
  );
};

export default Miner;
