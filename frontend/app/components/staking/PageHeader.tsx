import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

interface SectionHeaderProps {
  width: number;
  title: string;
}
const PageHeaderComponent: React.FC<SectionHeaderProps> = ({
  width,
  title,
}) => {
  const { getImage } = useImages();

  return (
    <View style={styles.container}>
      <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
        <Image
          image={getImage("shop.title")}
          fit="fill"
          x={0}
          y={0}
          width={width - 8}
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
    marginBottom: 40, // reduced to bring content up
  },
  title: {
    color: "#fff7ff",
    fontSize: 33, // text-2xl
    fontWeight: "700",
    position: "absolute",
    right: 8, // right-2
    fontFamily: "Teatime",
    top: -1,
  },
});

export const PageHeader = memo(PageHeaderComponent);
