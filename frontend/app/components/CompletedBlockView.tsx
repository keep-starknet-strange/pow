import React, { memo, useEffect } from "react";
import { View } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useChainsStore } from "../stores/useChainsStore";
import { useImages } from "../hooks/useImages";
import { BlockView } from "./BlockView";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";

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

export const CompletedBlockView: React.FC<CompletedBlockViewProps> = memo(
  (props) => {
    const { getImage } = useImages();
    const { workingBlocks } = useGameStore();
    const { getLatestBlock } = useChainsStore();

    const updateCompletedBlock = (chainId: number) => {
      const block = getLatestBlock(chainId);
      if (block) {
        setCompletedBlock(block);
      }
    };

    const [completedBlock, setCompletedBlock] = React.useState(
      getLatestBlock(props.chainId) || null,
    );
    const blockSlideLeftAnim = useSharedValue(props.placement.left);
    useEffect(() => {
      blockSlideLeftAnim.value = props.placement.left;
      if (!workingBlocks[props.chainId]?.blockId) {
        return;
      }
      blockSlideLeftAnim.value = withSequence(
        withTiming(props.placement.left, {
          duration: 400,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(props.completedPlacementLeft, { duration: 700 }, () =>
          runOnJS(updateCompletedBlock)(props.chainId),
        ),
        withTiming(props.placement.left, {
          duration: 100,
          easing: Easing.inOut(Easing.ease),
        }),
      );
    }, [
      props.chainId,
      props.placement.left,
      props.completedPlacementLeft,
      workingBlocks[props.chainId]?.blockId,
    ]);

    if (!completedBlock) {
      return null;
    }

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
        <BlockView
          chainId={props.chainId}
          block={completedBlock || null}
          completed={true}
        />
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the chainId or placement changes
    return (
      prevProps.chainId === nextProps.chainId &&
      prevProps.placement.left === nextProps.placement.left &&
      prevProps.placement.top === nextProps.placement.top &&
      prevProps.placement.width === nextProps.placement.width &&
      prevProps.placement.height === nextProps.placement.height &&
      prevProps.completedPlacementLeft === nextProps.completedPlacementLeft
    );
  },
);
