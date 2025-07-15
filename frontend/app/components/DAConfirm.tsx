import { View } from "react-native";
import { useUpgrades } from "../context/Upgrades";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";

import * as daImages from "../configs/da";
export const getDaIcon = (daId: number) => {
  const images = Object.values(daImages);
  return images[daId] || images[0];
};

import * as daAnimation from "../configs/storing";
export const getDaAnimation = (progress: number) => {
  const animations = Object.values(daAnimation);
  const animationIndex = Math.floor(progress * animations.length);
  return animations[animationIndex] || animations[0];
};

export const DAConfirm: React.FC = () => {
  const { automations } = useUpgrades();
  const { daProgress, daConfirm } = useGame();

  return (
    <View className="flex flex-col bg-[#27272740] rounded-xl relative w-full">
      <Confirmer
        progress={daProgress}
        text={"Click to store!"}
        getAnimation={getDaAnimation}
        onConfirm={daConfirm}
        renderedBy="da"
      />
    </View>
  );
};

export default DAConfirm;
