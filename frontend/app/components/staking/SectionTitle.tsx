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
export const SectionTitle: React.FC<SectionTitleProps> = ({ width, title }) => {
  const { getImage } = useImages();

  return (
    <View style={styles.container}>
      <Canvas style={{ width: width, height: 24 }}>
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
      <Text style={styles.title}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
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


