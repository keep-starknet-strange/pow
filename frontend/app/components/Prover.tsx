import { View } from "react-native";
import { useUpgrades } from "../context/Upgrades";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";

import * as proverImages from "../configs/provers";
export const getProverImage = (proverId: number) => {
  const images = Object.values(proverImages);
  return images[proverId] || images[0];
};

import * as ProvingAnimation from "../configs/proving";
export const getProvingAnimation = (progress: number) => {
  const animations = Object.values(ProvingAnimation);
  const animationIndex = Math.floor(progress * animations.length);
  return animations[animationIndex] || animations[0];
};

export const Prover: React.FC = () => {
  const { automations } = useUpgrades();
  const { proverProgress, prove } = useGame();

  return (
    <View className="flex flex-col bg-[#27272740] rounded-xl relative w-full">
      <Confirmer
        progress={proverProgress}
        text={"Click to prove!"}
        getAnimation={getProvingAnimation}
        onConfirm={prove}
        renderedBy="prover"
      />
    </View>
  );
};

export default Prover;
