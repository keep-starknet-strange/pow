import React, { useEffect, memo } from "react";
import { View } from "react-native";
import { useInterval } from "usehooks-ts";
import { useImages } from "../hooks/useImages";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
import {
  withTiming,
  Easing,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import {
  Canvas,
  ImageShader,
  Rect,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export const MainBackground: React.FC = memo(() => {
  const { getImage } = useImages();
  const { width, height } = useCachedWindowDimensions();

  const bgOffsetX = useSharedValue(0);
  const bgOffsetY = useSharedValue(0);
  const bgOverlayX2 = useSharedValue(0);
  const bgOverlayY2 = useSharedValue(0);

  // Every 8-10 seconds choose a new background offset
  const minTravelTime = 8000;
  const maxTravelTime = 10000;

  const getRandomTravelDirection = (
    travelDuration: number,
  ): { x: number; y: number } => {
    // Compute travel direction to be of unit size `travelDistance`
    const travelDistance = width * (travelDuration / maxTravelTime);
    const travelDirectionRadians = Math.random() * 2 * Math.PI;
    return {
      x: Math.cos(travelDirectionRadians) * travelDistance,
      y: Math.sin(travelDirectionRadians) * travelDistance,
    };
  };

  const updateBackgroundOffsets = (travelDuration: number) => {
    const { x: travelDirectionX, y: travelDirectionY } =
      getRandomTravelDirection(travelDuration);
    bgOffsetX.value = withTiming(bgOffsetX.value + travelDirectionX, {
      duration: travelDuration,
      easing: Easing.inOut(Easing.poly(2)),
    });
    bgOffsetY.value = withTiming(bgOffsetY.value + travelDirectionY, {
      duration: travelDuration,
      easing: Easing.inOut(Easing.poly(2)),
    });
    const parallaxScaler = 1.5; // Overlay parallax effect
    bgOverlayX2.value = withTiming(
      bgOverlayX2.value + travelDirectionX * parallaxScaler,
      { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) },
    );
    bgOverlayY2.value = withTiming(
      bgOverlayY2.value + travelDirectionY * parallaxScaler,
      { duration: travelDuration, easing: Easing.inOut(Easing.poly(2)) },
    );
  };

  useEffect(() => {
    const initialTravelDuration =
      minTravelTime + Math.random() * (maxTravelTime - minTravelTime);
    updateBackgroundOffsets(initialTravelDuration);
  }, []);
  useInterval(() => {
    const travelDuration =
      minTravelTime + Math.random() * (maxTravelTime - minTravelTime);
    updateBackgroundOffsets(travelDuration);
  }, maxTravelTime + 300);

  const bgRect = useDerivedValue(() => {
    return {
      x: bgOffsetX.value,
      y: bgOffsetY.value,
      width: width,
      height: height,
    };
  });

  const bgOverlayRect = useDerivedValue(() => {
    return {
      x: bgOverlayX2.value,
      y: bgOverlayY2.value,
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
              rect={bgRect}
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
              rect={bgOverlayRect}
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
});

export default MainBackground;
