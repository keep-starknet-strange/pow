import { View } from "react-native";
import { useGame } from "../context/Game";
import { Confirmer } from "./Confirmer";

export const DAConfirm: React.FC = () => {
  const { daProgress, daConfirm } = useGame();

  return (
    <View className="flex flex-col bg-[#27272740] rounded-xl relative w-full">
      <Confirmer
        progress={daProgress}
        text={"Click to store!"}
        onConfirm={daConfirm}
        renderedBy="da"
      />
    </View>
  );
};

export default DAConfirm;
