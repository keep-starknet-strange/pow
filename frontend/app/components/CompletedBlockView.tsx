import React from "react";
import { View } from "react-native";
import { useImages } from "../hooks/useImages";
import { Block } from "../types/Chains";
import { BlockView } from "./BlockView";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export type CompletedBlockViewProps = {
  chainId: number;
  block: Block | null;
  placement: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export const CompletedBlockView: React.FC<CompletedBlockViewProps> = (
  props,
) => {
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
      <View className="absolute top-[30%] right-[-16px] w-[16px] h-[20px]">
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
      <View className="absolute bottom-[30%] right-[-16px] w-[16px] h-[20px]">
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
      <BlockView chainId={props.chainId} block={props.block} completed={true} />
    </View>
  );
};
