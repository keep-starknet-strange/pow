import React, { memo } from "react";
import { View } from "react-native";
import { Canvas, Image } from "@shopify/react-native-skia";
import { FilterMode, MipmapMode } from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";
import { getTxImg, getBlockTxIcon } from "../utils/transactions";
import Animated, { BounceIn } from "react-native-reanimated";

interface BlockTxProps {
  // Transaction props
  txTypeId: number;
  chainId: number;
  isDapp: boolean;
  // Positioning props
  index: number;
  txSize: number;
  txPerRow: number;
}

export const BlockTx: React.FC<BlockTxProps> = memo((props) => {
  const { getImage } = useImages();
  return (
    <Animated.View
      entering={BounceIn.duration(400)}
      className="absolute"
      style={{
        width: props.txSize,
        height: props.txSize,
        left: (props.index % props.txPerRow) * props.txSize,
        top: Math.floor(props.index / props.txPerRow) * props.txSize,
      }}
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={getTxImg(
            props.chainId,
            props.txTypeId,
            props.isDapp,
            getImage,
          )}
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
      <View className="absolute top-0 left-0 w-full h-full justify-center items-center">
        <Canvas
          style={{ width: props.txSize * 0.4, height: props.txSize * 0.4 }}
        >
          <Image
            image={getBlockTxIcon(
              props.chainId,
              props.txTypeId,
              props.isDapp,
              getImage,
            )}
            fit="contain"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={0}
            width={props.txSize * 0.4}
            height={props.txSize * 0.4}
          />
        </Canvas>
      </View>
    </Animated.View>
  );
});
