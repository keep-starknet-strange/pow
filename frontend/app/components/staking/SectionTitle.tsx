import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

interface SectionTitleProps {
  width: number;
  title: string;
}
const SectionTitleComponent: React.FC<SectionTitleProps> = ({
  width,
  title,
}) => {
  const { getImage } = useImages();

  return (
    <View style={styles.container}>
      <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
        <Image
          image={getImage("shop.name.plaque")}
          fit="fill"
          x={0}
          y={0}
          width={width - 24}
          height={24}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
    marginLeft: 8,
    marginBottom: 4,
  },
  title: {
    color: "#fff7ff",
    fontSize: 28,
    fontWeight: "700",
    position: "absolute",
    left: 8, // left-2
    fontFamily: "Teatime",
    top: 1,
  },
});

export const SectionTitle = memo(SectionTitleComponent);
