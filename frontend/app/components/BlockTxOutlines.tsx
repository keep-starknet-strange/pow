import React, { memo } from "react";
import { View } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "@/app/hooks/useImages";

export type BlockTxOutlinesProps = {
  txPerRow: number;
  txSize: number;
};

export const BlockTxOutlines: React.FC<BlockTxOutlinesProps> = memo((props) => {
  const { getImage } = useImages();
  return (
    <View className="absolute top-0 left-0 w-full h-full">
      {Array.from({ length: props.txPerRow ** 2 || 0 }, (_, index) => (
        <Animated.View
          key={index}
          className="absolute"
          exiting={FadeOut}
          style={{
            left: (index % props.txPerRow) * props.txSize,
            top: Math.floor(index / props.txPerRow) * props.txSize,
            width: props.txSize,
            height: props.txSize,
          }}
        >
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getImage("block.bg.empty")}
              fit="fill"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              x={0}
              y={0}
              width={props.txSize}
              height={props.txSize}
            />
          </Canvas>
        </Animated.View>
      ))}
    </View>
  );
});
