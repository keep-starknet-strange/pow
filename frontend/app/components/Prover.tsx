import { View } from "react-native";
import { useUpgrades } from "../stores/useUpgradesStore";
import { Confirmer } from "./Confirmer";

interface ProverProps {
  triggerAnim: () => void;
  proverProgress: number;
  prove: () => void;
}

export const Prover: React.FC<ProverProps> = ({
  triggerAnim,
  proverProgress,
  prove,
}) => {
  return (
    <View className="flex flex-col bg-[#27272740] rounded-xl relative w-full">
      <Confirmer
        text={"Click to prove!"}
        onConfirm={() => {
          triggerAnim();
          prove();
        }}
        renderedBy="prover"
      />
    </View>
  );
};

export default Prover;
