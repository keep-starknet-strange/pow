import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useUpgrades } from "../stores/useUpgradesStore";
import { Confirmer } from "./Confirmer";

interface MinerProps {
  triggerAnim: () => void;
  miningProgress: number;
  mineBlock: () => void;
}

export const Miner: React.FC<MinerProps> = ({
  triggerAnim,
  miningProgress,
  mineBlock,
}) => {
  const [mineStartTime, setMineStartTime] = useState(Date.now());
  const [mineHash, setMineHash] = useState("0xdEadBeefDeadbE");
  const [mineColor, setMineColor] = useState("#CA1F4B");
  const generateRandomHash = (isDone: boolean) => {
    const difficulty = 4; // TODO
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
        onConfirm={() => {
          triggerAnim();
          mineBlock();
        }}
        renderedBy="miner"
        confirmPopup={{
          startTime: mineStartTime,
          value: mineHash,
          color: mineColor,
        }}
        specialFlashText={mineHash}
        specialFlashTextColor={mineColor}
      />
    </View>
  );
};
