import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useUpgrades } from "../stores/useUpgradesStore";
import { Confirmer } from "./Confirmer";

interface MinerProps {
  triggerAnim: () => void;
  mineBlock: () => void;
}

export const Miner: React.FC<MinerProps> = ({ triggerAnim, mineBlock }) => {
  const [mineHash, setMineHash] = useState("0xdEadBeefDeadbE");
  const [mineColor, setMineColor] = useState("#CA1F4B");
  const [mineStartTime, setMineStartTime] = useState(Date.now());
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
  return (
    <View className="flex flex-col h-full aspect-square rounded-xl relative">
      <Confirmer
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
      />
    </View>
  );
};
