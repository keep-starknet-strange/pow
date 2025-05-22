import { View } from "react-native";
import { useUpgrades } from "../context/Upgrades";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";

import * as sequencerImages from "../configs/sequencers";
export const getSequencerImage = (sequencerId: number) => {
  const images = Object.values(sequencerImages);
  return images[sequencerId] || images[0];
}

import * as SequencingAnimation from "../configs/sequencing";
export const getSequencingAnimation = (progress: number) => {
  const animations = Object.values(SequencingAnimation);
  const animationIndex = Math.floor(progress * animations.length);
  return animations[animationIndex] || animations[0];
}

export const Sequencer: React.FC = () => {
  const { automations } = useUpgrades();
  const { sequencingProgress, sequenceBlock } = useGame();

  return (
    <View className="flex flex-col bg-[#27272740] h-full aspect-square rounded-xl relative">
      <Confirmer
        progress={sequencingProgress}
        image={getSequencerImage(automations[1][0] + 1)}
        getAnimation={getSequencingAnimation}
        onConfirm={sequenceBlock}
        renderedBy="sequencer"
      />
    </View>
  );
};

export default Sequencer;
