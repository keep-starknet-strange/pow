import { View, Text, StyleSheet } from "react-native";
import {
  Canvas, Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

interface SectionTitleProps {
  width: number;
  title: string;
}
export const SectionTitle: React.FC<SectionTitleProps> = ({ width, title }) => {
  const { getImage } = useImages();

  return (
    <View style={styles.container}>
      <Canvas style={{ width: width - 8, height: 28 }}>
        <Image
          image={getImage("shop.title")}
          fit="fill"
          x={0}
          y={0}
          width={width-8}
          height={28}
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
    marginBottom: 14,
  },
  title: {
    color: "#fff7ff",
    fontSize: 24,
    fontWeight: "700",
    position: "absolute",
    left: 8,
    fontFamily: "Pixels",
    top: 2,
  },
});
