import { View } from "react-native";
import { useUpgrades } from "../context/Upgrades";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";

export const Prover: React.FC = () => {
  const { proverProgress, prove } = useGame();

  return (
    <View className="flex flex-col bg-[#27272740] rounded-xl relative w-full">
      <Confirmer
        progress={proverProgress}
        text={"Click to prove!"}
        onConfirm={prove}
        renderedBy="prover"
      />
    </View>
  );
};

export default Prover;
