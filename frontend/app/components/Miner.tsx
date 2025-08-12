import React from "react";
import { View } from "react-native";
import { Confirmer } from "./Confirmer";

interface MinerProps {
  triggerAnim: () => void;
  mineBlock: () => void;
}

export const Miner: React.FC<MinerProps> = ({ triggerAnim, mineBlock }) => {
  return (
    <View className="flex flex-col h-full aspect-square rounded-xl relative">
      <Confirmer
        onConfirm={() => {
          triggerAnim();
          mineBlock();
        }}
        renderedBy="miner"
      />
    </View>
  );
};
