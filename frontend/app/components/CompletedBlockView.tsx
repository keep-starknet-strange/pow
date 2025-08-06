import React, { memo, useEffect, useCallback } from "react";
import { View } from "react-native";
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
  workingBlockId?: number;
  completedBlock: any;
};

type CompletedBlockContentProps = {
  chainId: number;
  placement: {
    width: number;
    height: number;
  };
  completedBlock: any;
};

const CompletedBlockContent: React.FC<CompletedBlockContentProps> = memo(
  ({ chainId, placement, completedBlock }) => {
    const { getImage } = useImages();

    return (
      <>
        <View className="absolute top-0 left-0 w-full h-full z-[2]">
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getImage("block.grid.min")}
              fit="fill"
              x={0}
              y={0}
              width={placement.width}
              height={placement.height}
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
          chainId={chainId}
          block={completedBlock || null}
          completed={true}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.chainId === nextProps.chainId &&
      prevProps.placement.width === nextProps.placement.width &&
      prevProps.placement.height === nextProps.placement.height &&
      prevProps.completedBlock === nextProps.completedBlock
    );
  },
);

CompletedBlockContent.displayName = "CompletedBlockContent";

export const CompletedBlockView: React.FC<CompletedBlockViewProps> = memo(
  (props) => {
    const [displayedBlock, setDisplayedBlock] = React.useState(
      props.completedBlock || null,
    );
    const hasAnimatedRef = React.useRef(false);

    // Only update immediately on first mount if there's already a completed block
    useEffect(() => {
      if (
        !hasAnimatedRef.current &&
        props.completedBlock &&
        !props.workingBlockId
      ) {
        // Initial load with completed block but no working block - show immediately
        setDisplayedBlock(props.completedBlock);
      }
    }, []); // Intentionally only run on mount

    const updateDisplayedBlock = useCallback(() => {
      if (props.completedBlock) {
        setDisplayedBlock(props.completedBlock);
        hasAnimatedRef.current = true;
      }
    }, [props.completedBlock]);
    const blockSlideLeftAnim = useSharedValue(props.placement.left);
    useEffect(() => {
      blockSlideLeftAnim.value = props.placement.left;
      if (!props.workingBlockId) {
        return;
      }
      blockSlideLeftAnim.value = withSequence(
        withTiming(props.placement.left, {
          duration: 400,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(props.completedPlacementLeft, { duration: 700 }, () =>
          runOnJS(updateDisplayedBlock)(),
        ),
        withTiming(props.placement.left, {
          duration: 100,
          easing: Easing.inOut(Easing.ease),
        }),
      );
    }, [
      props.placement.left,
      props.completedPlacementLeft,
      props.workingBlockId,
      updateDisplayedBlock,
    ]);

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
        {displayedBlock && (
          <CompletedBlockContent
            chainId={props.chainId}
            placement={props.placement}
            completedBlock={displayedBlock}
          />
        )}
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.chainId === nextProps.chainId &&
      prevProps.placement.left === nextProps.placement.left &&
      prevProps.placement.top === nextProps.placement.top &&
      prevProps.placement.width === nextProps.placement.width &&
      prevProps.placement.height === nextProps.placement.height &&
      prevProps.completedPlacementLeft === nextProps.completedPlacementLeft &&
      prevProps.workingBlockId === nextProps.workingBlockId &&
      prevProps.completedBlock === nextProps.completedBlock
    );
  },
);

CompletedBlockView.displayName = "CompletedBlockView";
