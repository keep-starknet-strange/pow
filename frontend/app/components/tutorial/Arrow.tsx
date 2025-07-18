import React, { memo, useMemo } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import {
  Canvas,
  Image as SkiaImage,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

type Direction = "up" | "down";

export interface ArrowProps {
  direction: Direction;
  style: StyleProp<ViewStyle>;
  size?: { width: number; height: number };
}

const DEFAULT_SIZE = { width: 18, height: 10 };

const ArrowComponent: React.FC<ArrowProps> = ({
  direction,
  style,
  size = DEFAULT_SIZE,
}) => {
  const { getImage } = useImages();
  const transform = useMemo<ViewStyle["transform"]>(
    () => [{ rotate: direction === "down" ? "180deg" : "0deg" }],
    [direction],
  );

  return (
    <View
      pointerEvents="none"
      style={[style, { width: size.width, height: size.height, transform }]}
    >
      <Canvas style={StyleSheet.absoluteFillObject}>
        <SkiaImage
          image={getImage("tutorial.arrow")}
          width={size.width}
          height={size.height}
          fit="fill"
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
        />
      </Canvas>
    </View>
  );
};

export const Arrow = memo(ArrowComponent);
