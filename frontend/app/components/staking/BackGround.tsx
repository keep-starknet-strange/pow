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

export const BackGround: React.FC<BackGroundProps> = ({ width, height }) => {
  const { getImage } = useImages();

  return (
    <View className="absolute w-full h-full">
      <Canvas style={{ flex: 1 }} className="w-full h-full">
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
