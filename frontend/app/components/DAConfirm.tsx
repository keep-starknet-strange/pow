import { View } from "react-native";
import { Confirmer } from "./Confirmer";

interface DAConfirmProps {
  triggerAnim: () => void;
  daProgress: number;
  daConfirm: () => void;
}

export const DAConfirm: React.FC<DAConfirmProps> = ({
  triggerAnim,
  daProgress,
  daConfirm,
}) => {
  return (
    <View className="flex flex-col bg-[#27272740] rounded-xl relative w-full">
      <Confirmer
        progress={daProgress}
        text={"Click to store!"}
        onConfirm={() => {
          triggerAnim();
          daConfirm();
        }}
        renderedBy="da"
      />
    </View>
  );
};

export default DAConfirm;
