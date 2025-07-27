import { View } from "react-native";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";
import { getAutomationIcon } from "../utils/upgrades";

export const Sequencer: React.FC = () => {
  const { sequencingProgress, sequenceBlock } = useGame();

  return (
    <View className="flex flex-col h-full aspect-square relative">
      <Confirmer
        progress={sequencingProgress}
        image={getAutomationIcon(1, "Sequencer", 0)}
        onConfirm={sequenceBlock}
        renderedBy="sequencer"
      />
    </View>
  );
};

export default Sequencer;
