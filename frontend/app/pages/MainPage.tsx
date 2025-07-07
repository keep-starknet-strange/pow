import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { useGame } from "../context/Game";
import { useImageProvider } from "../context/ImageProvider";
import { L1Phase } from "./main/L1Phase";
import { L2Phase } from "./main/L2Phase";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { MainBackground } from "../components/MainBackground";

export const MainPage: React.FC = () => {
  const { l2 } = useGame();
  const { getImage } = useImageProvider();

  const [currentView, setCurrentView] = React.useState(l2 ? "L2" : "L1");
  useEffect(() => {
    setCurrentView(l2 ? "L2" : "L1");
  }, [l2]);

  return (
    <View className="flex-1 relative">
      <MainBackground />
      {l2 && (
        <TouchableOpacity
          onPress={() => {
            setCurrentView((prev) => (prev === "L1" ? "L2" : "L1"));
          }}
          className="absolute right-1 top-1 z-[10] w-[36px] h-[36px]"
        >
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getImage("tx.icon.tx")}
              fit="fill"
              x={0}
              y={0}
              width={36}
              height={36}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
        </TouchableOpacity>
      )}
      {l2 && currentView === "L2" ? (
        <L2Phase setCurrentView={setCurrentView} />
      ) : (
        <L1Phase setCurrentView={setCurrentView} />
      )}
    </View>
  );
};

export default MainPage;
