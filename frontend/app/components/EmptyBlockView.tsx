import { StyleProp, View, ViewStyle } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";

export type EmptyViewProps = {
  placement: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export const EmptyBlockView: React.FC<EmptyViewProps> = (props) => {
  const { getImage } = useImages();

  return (
    <View
      style={{
        position: "absolute",
        top: props.placement.top,
        left: props.placement.left,
        width: props.placement.width,
        height: props.placement.height,
      }}
    >
      <View className="absolute top-0 left-0 w-full h-full z-[2]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("block.grid.min")}
            fit="fill"
            x={0}
            y={0}
            width={props.placement.width}
            height={props.placement.height}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      <View className="absolute top-[30%] left-[-16px] w-[16px] h-[20px]">
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
      <View className="absolute bottom-[30%] left-[-16px] w-[16px] h-[20px]">
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
