import React from "react";
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
  return (
    <View className="flex flex-col h-full aspect-square rounded-xl relative">
      <Confirmer
        progress={miningProgress}
        onConfirm={() => {
          triggerAnim();
          mineBlock();
        }}
        renderedBy="miner"
      />
    </View>
  );
};
