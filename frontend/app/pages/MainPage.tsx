import { ScrollView, View } from "react-native";
import { useGame } from "../context/Game";
import { L1Phase } from "./main/L1Phase";
import { L2Phase } from "./main/L2Phase";

export const MainPage: React.FC = () => {
  const { l2 } = useGame();

  return (
    <ScrollView 
          className="flex-1"
          contentContainerClassName="flex-grow pb-[10rem]">
      <View className="flex">
        <L1Phase />
      </View>
      {l2 && (
        <View className="flex pb-[8rem]">
          <L2Phase />
        </View>
      )}
    </ScrollView>
  );
}

export default MainPage;
