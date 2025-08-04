import React from "react";
import { View, Dimensions } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "@/app/hooks/useImages";
import { useRef } from "react";
import Animated, { FadeInLeft, runOnJS } from "react-native-reanimated";
import { InteractionManager } from "react-native";

export const ShopTitle: React.FC<{ position: "left" | "right" }> = React.memo(
  ({ position }) => {
    const handleRef = useRef<number | null>(null);
    const { getImage } = useImages();
    let { width } = Dimensions.get("window");
    width = position === "left" ? 290 : width - 8;

    if (handleRef.current === null) {
      handleRef.current = InteractionManager.createInteractionHandle();
    }

    const clearHandle = () => {
      if (handleRef.current !== null) {
        InteractionManager.clearInteractionHandle(handleRef.current);
        handleRef.current = null;
      }
    };

    return (
      <View className="w-full relative">
        <Canvas style={{ width: width, height: 24, marginLeft: 4 }}>
          <Image
            image={getImage("shop.name.plaque")}
            fit="fill"
            x={0}
            y={0}
            width={width}
            height={24}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <Animated.Text
          className={`font-Pixels text-xl absolute ${
            position === "left" ? "left-[12px]" : "right-2"
          } text-[#fff7ff]`}
          entering={FadeInLeft.duration(300).withCallback(() => {
            runOnJS(clearHandle)();
          })}
        >
          SHOP
        </Animated.Text>
      </View>
    );
  },
);
