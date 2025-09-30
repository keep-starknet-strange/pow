import React, { memo } from "react";
import { useImages } from "../../hooks/useImages";
import { View, StyleSheet } from "react-native";
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

const BackGroundComponent: React.FC<BackGroundProps> = ({ width, height }) => {
  const { getImage } = useImages();

  return (
    <View style={styles.root}>
      <Canvas style={styles.fill}>
        <Image
          image={getImage("background.staking")}
          fit="fill"
          x={0}
          y={-62}
          width={width}
          height={height}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  fill: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export const BackGround = memo(BackGroundComponent);
