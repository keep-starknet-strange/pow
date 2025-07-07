import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import { useImageProvider } from "../context/ImageProvider";
import { withTiming, Easing, useDerivedValue, useSharedValue } from "react-native-reanimated";
import {
  Canvas,
  ImageShader,
  Rect,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export const MainBackground: React.FC = () => {
  const { getImage } = useImageProvider();
  const { width, height } = Dimensions.get("window");

  const bgOffsetX = useSharedValue(0);
  const bgOffsetY = useSharedValue(0);
  const bgOffsetX2 = useSharedValue(0);
  const bgOffsetY2 = useSharedValue(0);
  // Every 3-5 seconds choose a new background offset
  React.useEffect(() => {
    const minTravelTime = 8000;
    const maxTravelTime = 10000;
    let travelDuration = minTravelTime + Math.random() * (maxTravelTime - minTravelTime);
    const travelDistance = width * (travelDuration / maxTravelTime);
    const travelDirectionRadians = Math.random() * 2 * Math.PI;
    const travelDirectionX = Math.cos(travelDirectionRadians) * travelDistance;
    const travelDirectionY = Math.sin(travelDirectionRadians) * travelDistance;
    const newOffsetX = withTiming(bgOffsetX.value + travelDirectionX, { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) });
    const newOffsetY = withTiming(bgOffsetY.value + travelDirectionY, { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) });
    bgOffsetX.value = newOffsetX;
    bgOffsetY.value = newOffsetY;
    const parallaxScaler = 1.7;
    const newOffsetX2 = withTiming(bgOffsetX2.value + travelDirectionX * parallaxScaler, { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) });
    const newOffsetY2 = withTiming(bgOffsetY2.value + travelDirectionY * parallaxScaler, { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) });
    bgOffsetX2.value = newOffsetX2;
    bgOffsetY2.value = newOffsetY2;

    const interval = setInterval(() => {
      travelDuration = minTravelTime + Math.random() * (maxTravelTime - minTravelTime);
      const travelDistance = width * (travelDuration / maxTravelTime);
      const travelDirectionRadians = Math.random() * 2 * Math.PI;
      const travelDirectionX = Math.cos(travelDirectionRadians) * travelDistance;
      const travelDirectionY = Math.sin(travelDirectionRadians) * travelDistance;
      bgOffsetX.value = withTiming(bgOffsetX.value + travelDirectionX, { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) });
      bgOffsetY.value = withTiming(bgOffsetY.value + travelDirectionY, { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) });
      const parallaxScaler = 1.5;
      bgOffsetX2.value = withTiming(bgOffsetX2.value + travelDirectionX * parallaxScaler, { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) });
      bgOffsetY2.value = withTiming(bgOffsetY2.value + travelDirectionY * parallaxScaler, { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) });
    }, travelDuration + 300); 
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

  const animatedRect2 = useDerivedValue(() => {
    return {
      x: bgOffsetX2.value,
      y: bgOffsetY2.value,
      width: width,
      height: height,
    };
  });

  return (
    <View className="absolute w-full h-full">
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
    </View>
  );
};

export default MainBackground;
