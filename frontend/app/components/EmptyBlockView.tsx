import { View } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImageProvider } from "../context/ImageProvider";

export const EmptyBlockView: React.FC = () => {
  const { getImage } = useImageProvider();

  return (
    <View className="w-[346px] h-[340px] relative">
      <View className="absolute top-0 left-0 w-full h-full z-[2]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("block.grid.min")}
            fit="fill"
            x={0}
            y={0}
            width={144 * 2.4}
            height={142 * 2.4}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      <View className="absolute top-[80px] left-[-16px] w-[16px] h-[20px]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("block.connector")}
            fit="fill"
            x={0}
            y={0}
            width={16}
            height={20}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      <View className="absolute bottom-[80px] left-[-16px] w-[16px] h-[20px]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("block.connector")}
            fit="fill"
            x={0}
            y={0}
            width={16}
            height={20}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>

      <View className="flex-1 bg-[#10111908] aspect-square relative">
        <View className="flex flex-wrap w-full aspect-square"></View>
      </View>
    </View>
  );
};

export default EmptyBlockView;
