import { Dimensions } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "@/app/hooks/useImages";

export const UnlockBackground: React.FC = () => {
  const { width } = Dimensions.get("window");
  const { getImage } = useImages();

  return (
    <Canvas style={{ width: width - 32, height: 92 }}>
      <Image
        image={getImage("button.secondary")}
        fit="fill"
        sampling={{
          filter: FilterMode.Nearest,
          mipmap: MipmapMode.Nearest,
        }}
        x={0}
        y={0}
        width={width - 32}
        height={92}
      />
    </Canvas>
  );
};
