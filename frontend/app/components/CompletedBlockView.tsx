import React, { useEffect } from "react";
import { View } from "react-native";
import { useImageProvider } from "../context/ImageProvider";
import { useGame } from "../context/Game";
import { useChains } from "../context/Chains";
import { BlockView } from "./BlockView";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import Animated, { useSharedValue, withSpring, withTiming, withSequence, runOnJS, Easing } from "react-native-reanimated";

export type CompletedBlockViewProps = {
  chainId: number;
  placement: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  completedPlacementLeft: number;
};

export const CompletedBlockView: React.FC<CompletedBlockViewProps> = (
  props,
) => {
  const { getImage } = useImageProvider();
  const { workingBlocks } = useGame();
  const { getLatestBlock } = useChains();

  const updateCompletedBlock = (chainId: number) => {
    const block = getLatestBlock(chainId);
    if (block) {
      setCompletedBlock(block);
    }
  }

  const [completedBlock, setCompletedBlock] = React.useState(
    getLatestBlock(props.chainId) || null,
  );
  const blockSlideLeftAnim = useSharedValue(props.placement.left);
  useEffect(() => {
    blockSlideLeftAnim.value = props.placement.left;
    if (workingBlocks[props.chainId]?.blockId) {
      blockSlideLeftAnim.value = withSequence(
        withSpring(
          props.completedPlacementLeft,
          { duration: 500 },
          () => runOnJS(updateCompletedBlock)(props.chainId)
        ),
        withTiming(
          props.placement.left,
          { duration: 100, easing: Easing.inOut(Easing.ease) }
        ),
      );
    }
  }, [props.chainId, workingBlocks[props.chainId]?.blockId, props.placement.left, props.completedPlacementLeft]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: props.placement.top,
        left: blockSlideLeftAnim,
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
      <BlockView chainId={props.chainId} block={completedBlock} completed={true} />
    </Animated.View>
  );
};
