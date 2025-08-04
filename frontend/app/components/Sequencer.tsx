import { View } from "react-native";
import { Confirmer } from "./Confirmer";

interface SequencerProps {
  triggerAnim: () => void;
  sequencingProgress: number;
  sequenceBlock: () => void;
}

export const Sequencer: React.FC<SequencerProps> = ({
  triggerAnim,
  sequencingProgress,
  sequenceBlock,
}) => {
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
