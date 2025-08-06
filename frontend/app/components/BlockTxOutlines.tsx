import React, { memo, useMemo } from "react";
import { View } from "react-native";
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

export const BlockTxOutlines: React.FC<BlockTxOutlinesProps> = memo(
  (props) => {
    const { getImage } = useImages();

    const txOutlines = useMemo(() => {
      return Array.from({ length: props.txPerRow ** 2 || 0 }, (_, index) => (
        <View
          key={index}
          className="absolute"
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
        </View>
      ));
    }, [props.txPerRow, props.txSize, getImage]);

    return (
      <View className="absolute top-0 left-0 w-full h-full">{txOutlines}</View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.txPerRow === nextProps.txPerRow &&
      Math.abs(prevProps.txSize - nextProps.txSize) <= 1
    );
  },
);
