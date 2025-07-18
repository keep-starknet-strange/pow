import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Canvas, Image as SkiaImage, FilterMode, MipmapMode } from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

const DEFAULT = 12;      // ← pick the size that matches your asset

interface ArrowProps {
  style?: ViewStyle | ViewStyle[];
}

export const Arrow: React.FC<ArrowProps> = ({ style }) => {
  const { getImage } = useImages();

  // Get any incoming width/height or fall back to DEFAULT
  const flat = StyleSheet.flatten(style as ViewStyle) || {};
  const width  = typeof flat.width === "number" ? flat.width : DEFAULT;
  const height = typeof flat.height === "number" ? flat.height : DEFAULT;

    const positionStyle: ViewStyle = {
    position: flat.position,
    top: flat.top,
    bottom: flat.bottom,
    left: flat.left,
    right: flat.right,
  };

  /** point down when borderTopWidth is set (bubble is above target) */
  const rotateDown = !!flat.borderTopWidth;
  const transform = [{ rotate: rotateDown ? "180deg" : "0deg" }];

  return (
    <View
      pointerEvents="none"
      style={[positionStyle, { width: width, height: height, transform }]}
    >
      <Canvas style={StyleSheet.absoluteFillObject}>
        <SkiaImage
          image={getImage("tutorial.arrow")}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="fill"
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
        />
      </Canvas>
    </View>
  );
};
