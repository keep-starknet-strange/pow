import { View } from "react-native";
import { Confirmer } from "./Confirmer";

interface SequencerProps {
  triggerAnim: () => void;
  sequenceBlock: () => void;
}

export const Sequencer: React.FC<SequencerProps> = ({
  triggerAnim,
  sequenceBlock,
}) => {
  return (
    <View className="flex flex-col h-full aspect-square relative">
      <Confirmer
        onConfirm={() => {
          triggerAnim();
          sequenceBlock();
        }}
        renderedBy="sequencer"
      />
    </View>
  );
};
