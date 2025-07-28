import React, { memo, useEffect } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";
import { useGameStore } from "@/app/stores/useGameStore";
import Animated, {
  useSharedValue,
} from "react-native-reanimated";

export type EmptyViewProps = {
  chainId: number;
  placement: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  completedPlacementLeft: number;
};

export const EmptyBlockView: React.FC<EmptyViewProps> = memo((props) => {
  const { getImage } = useImages();
  const { workingBlocks } = useGameStore();

  const blockSlideLeftAnim = useSharedValue(props.placement.left);
  useEffect(() => {
    blockSlideLeftAnim.value = props.placement.left;
    /* TODO: Include empty block animation?
    if (workingBlocks[props.chainId]?.blockId) {
      blockSlideLeftAnim.value = withSequence(
        withTiming(
          props.placement.left,
          { duration: 400, easing: Easing.inOut(Easing.ease) }
        ),
        withTiming(
          props.completedPlacementLeft,
          { duration: 700 },
        ),
        withTiming(
          props.placement.left,
          { duration: 0, easing: Easing.inOut(Easing.ease) }
        ),
      );
    }
    */
  }, [props.chainId, props.placement.left, props.completedPlacementLeft]);

  if (!workingBlocks[props.chainId]?.blockId) {
    return null; // No empty block at genesis
  }

  console.log("Rendering EmptyBlockView", props.chainId, props.placement, props.completedPlacementLeft);
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
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.chainId === nextProps.chainId &&
    prevProps.placement.top === nextProps.placement.top &&
    prevProps.placement.left === nextProps.placement.left &&
    prevProps.placement.width === nextProps.placement.width &&
    prevProps.placement.height === nextProps.placement.height &&
    prevProps.completedPlacementLeft === nextProps.completedPlacementLeft
  );
});

export default EmptyBlockView;
