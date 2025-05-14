import { useRef } from "react";
import { View } from "react-native";
import { useUpgrades } from "../context/Upgrades";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";

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
  const { automations } = useUpgrades();
  const { miningProgress, mineBlock } = useGame();

  return (
    <View className="flex flex-col bg-[#27272740] h-full aspect-square rounded-xl relative"
    >
      <Confirmer
        progress={miningProgress}
        image={getMinerImage(automations[0][0] + 1)}
        getAnimation={getMiningAnimation}
        onConfirm={mineBlock}
        renderedBy="miner"
      />
    </View>
  );
};

export default Miner;
