import React from "react";
import { View, Dimensions, ImageBackground } from "react-native";
import { useGame } from "../context/Game";
import { useImageProvider } from "../context/ImageProvider";
import { L1Phase } from "./main/L1Phase";
import { L2Phase } from "./main/L2Phase";
import { Canvas, Image, FilterMode, MipmapMode } from '@shopify/react-native-skia';

export const MainPage: React.FC = () => {
  const { l2 } = useGame();
  const { getImage } = useImageProvider();

  const [currentView, setCurrentView] = React.useState(l2 ? "L2" : "L1");

  return (
    <View
      className="flex-1 relative"
    >
      <View className="absolute h-[1000px] w-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image image={getImage('background')} fit="fill" x={0} y={0} width={410} height={1000} sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}/>
        </Canvas>
      </View>
      <View className="absolute h-[1000px] w-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image image={getImage('background.grid')} fit="fill" x={0} y={0} width={410} height={1000} sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}/>
        </Canvas>
      </View>
      {l2 && currentView === "L2" ? (
        <L2Phase setCurrentView={setCurrentView} />
      ) : (
        <L1Phase setCurrentView={setCurrentView} />
      )}
    </View>
  );
}

export default MainPage;
