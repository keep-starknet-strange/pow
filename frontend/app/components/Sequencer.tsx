import { View } from "react-native";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";

interface SequencerProps {
  triggerAnim: () => void;
}

export const Sequencer: React.FC<SequencerProps> = ({ triggerAnim }) => {
  const { sequencingProgress, sequenceBlock } = useGame();

  return (
    <View className="flex flex-col h-full aspect-square relative">
      <Confirmer
        progress={sequencingProgress}
        onConfirm={() => {
          triggerAnim();
          sequenceBlock();
        }}
        renderedBy="sequencer"
      />
    </View>
  );
};
