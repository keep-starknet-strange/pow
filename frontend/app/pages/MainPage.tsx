import React, { useEffect } from "react";
import { View, Dimensions, TouchableOpacity } from "react-native";
import { useGame } from "../context/Game";
import { useImageProvider } from "../context/ImageProvider";
import { L1Phase } from "./main/L1Phase";
import { L2Phase } from "./main/L2Phase";
import {
  Canvas,
  Image,
  ImageShader,
  Rect,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { withTiming, Easing, useDerivedValue, useSharedValue } from "react-native-reanimated";

export const MainPage: React.FC = () => {
  const { l2 } = useGame();
  const { getImage } = useImageProvider();
  const { width, height } = Dimensions.get("window");

  const [currentView, setCurrentView] = React.useState(l2 ? "L2" : "L1");
  useEffect(() => {
    setCurrentView(l2 ? "L2" : "L1");
  }, [l2]);

  const bgOffsetX = useSharedValue(0);
  const bgOffsetY = useSharedValue(0);
  // Every 3-5 seconds choose a new background offset
  React.useEffect(() => {
    const minTravelTime = 5000;
    const maxTravelTime = 8000;
    let travelDuration = minTravelTime + Math.random() * (maxTravelTime - minTravelTime);
    const travelDistance = width * (travelDuration / maxTravelTime);
    const travelDirectionRadians = Math.random() * 2 * Math.PI;
    const travelDirectionX = Math.cos(travelDirectionRadians) * travelDistance;
    const travelDirectionY = Math.sin(travelDirectionRadians) * travelDistance;
    const newOffsetX = withTiming(bgOffsetX.value + travelDirectionX, { duration: travelDuration, easing: Easing.bezier(0.55, -0.33, 0.71, 1.03) });
    const newOffsetY = withTiming(bgOffsetY.value + travelDirectionY, { duration: travelDuration, easing: Easing.bezier(0.55, -0.33, 0.71, 1.03) });
    bgOffsetX.value = newOffsetX;
    bgOffsetY.value = newOffsetY;

    const interval = setInterval(() => {
      travelDuration = minTravelTime + Math.random() * (maxTravelTime - minTravelTime);
      const travelDistance = width * (travelDuration / maxTravelTime);
      const travelDirectionRadians = Math.random() * 2 * Math.PI;
      const travelDirectionX = Math.cos(travelDirectionRadians) * travelDistance;
      const travelDirectionY = Math.sin(travelDirectionRadians) * travelDistance;
      bgOffsetX.value = withTiming(bgOffsetX.value + travelDirectionX, { duration: travelDuration, easing: Easing.bezier(0.55, -0.33, 0.71, 1.03) });
      bgOffsetY.value = withTiming(bgOffsetY.value + travelDirectionY, { duration: travelDuration, easing: Easing.bezier(0.55, -0.33, 0.71, 1.03) });
    }, travelDuration); 
    return () => clearInterval(interval);
  }, [bgOffsetX, bgOffsetY, width]);

  const animatedRect = useDerivedValue(() => {
    return {
      x: bgOffsetX.value,
      y: bgOffsetY.value,
      width: width,
      height: height,
    };
  });

  const bgOffsetX2 = useSharedValue(0);
  const bgOffsetY2 = useSharedValue(0);
  React.useEffect(() => {
    const minTravelTime = 6000;
    const maxTravelTime = 9000;
    let travelDuration = minTravelTime + Math.random() * (maxTravelTime - minTravelTime);
    const travelDistance = width * (travelDuration / maxTravelTime);
    const travelDirectionRadians = Math.random() * 2 * Math.PI;
    const travelDirectionX = Math.cos(travelDirectionRadians) * travelDistance;
    const travelDirectionY = Math.sin(travelDirectionRadians) * travelDistance;
    const newOffsetX2 = withTiming(bgOffsetX2.value + travelDirectionX, { duration: travelDuration, easing: Easing.bezier(0.55, -0.33, 0.71, 1.03) });
    const newOffsetY2 = withTiming(bgOffsetY2.value + travelDirectionY, { duration: travelDuration, easing: Easing.bezier(0.55, -0.33, 0.71, 1.03) });
    bgOffsetX2.value = newOffsetX2;
    bgOffsetY2.value = newOffsetY2;

    const interval = setInterval(() => {
      travelDuration = minTravelTime + Math.random() * (maxTravelTime - minTravelTime);
      const travelDistance = width * (travelDuration / maxTravelTime);
      const travelDirectionRadians = Math.random() * 2 * Math.PI;
      const travelDirectionX = Math.cos(travelDirectionRadians) * travelDistance;
      const travelDirectionY = Math.sin(travelDirectionRadians) * travelDistance;
      bgOffsetX2.value = withTiming(bgOffsetX2.value + travelDirectionX, { duration: travelDuration, easing: Easing.bezier(0.55, -0.33, 0.71, 1.03) });
      bgOffsetY2.value = withTiming(bgOffsetY2.value + travelDirectionY, { duration: travelDuration, easing: Easing.bezier(0.55, -0.33, 0.71, 1.03) });
    }, travelDuration); 
    return () => clearInterval(interval);
  }, [bgOffsetX2, bgOffsetY2, width]);
  const animatedRect2 = useDerivedValue(() => {
    return {
      x: bgOffsetX2.value,
      y: bgOffsetY2.value,
      width: width,
      height: height,
    };
  });

  return (
    <View className="flex-1 relative">
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Rect x={0} y={0} width={width} height={height}>
            <ImageShader
              image={getImage("background")}
              fit="cover"
              rect={animatedRect}
              tx={"repeat"}
              ty={"repeat"}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Rect>
        </Canvas>
      </View>
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Rect x={0} y={0} width={width} height={height}>
            <ImageShader
              image={getImage("background.grid")}
              fit="cover"
              rect={animatedRect2}
              tx={"repeat"}
              ty={"repeat"}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Rect>
        </Canvas>
      </View>
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
