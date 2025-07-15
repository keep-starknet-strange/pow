import { View } from "react-native";
import { useUpgrades } from "../context/Upgrades";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";
import { getAutomationIcon } from "../utils/upgrades";

import * as SequencingAnimation from "../configs/sequencing";
export const getSequencingAnimation = (progress: number) => {
  const animations = Object.values(SequencingAnimation);
  const animationIndex = Math.floor(progress * animations.length);
  return animations[animationIndex] || animations[0];
};

export const Sequencer: React.FC = () => {
  const { automations } = useUpgrades();
  const { sequencingProgress, sequenceBlock } = useGame();

  return (
    <View className="flex flex-col h-full aspect-square relative">
      <Confirmer
        progress={sequencingProgress}
        image={getAutomationIcon(1, "Sequencer", 0)}
        getAnimation={getSequencingAnimation}
        onConfirm={sequenceBlock}
        renderedBy="sequencer"
      />
    </View>
  );
};

export default Sequencer;
