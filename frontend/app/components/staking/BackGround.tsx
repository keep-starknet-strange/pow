import React from "react";
import { useImages } from "../../hooks/useImages";
import { View } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

interface BackGroundProps {
  width: number;
  height: number;
}

export const BackGround: React.FC<BackGroundProps> = React.memo(
  ({ width, height }) => {
    const { getImage } = useImages();

    return (
      <View className="absolute w-full h-full" style={{ backgroundColor: "#0f0f14", zIndex: -1 }}>
        <Canvas style={{ flex: 1 }}>
          <Image
            image={getImage("background.staking")}
            fit="cover"
            x={-2}
            y={0}
            width={width + 4}
            height={height + 2}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
    );
  },
);
