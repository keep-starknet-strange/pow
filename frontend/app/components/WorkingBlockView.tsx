import React, { memo, useEffect } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useUpgrades } from "../context/Upgrades";
import { useImages } from "../hooks/useImages";
import { BlockView } from "./BlockView";
import { Miner } from "./Miner";
import { Sequencer } from "./Sequencer";
import Animated, {
  runOnJS,
  Easing,
  useSharedValue,
  withSequence,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export type WorkingBlockViewProps = {
  chainId: number;
  placement: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  completedPlacementLeft: number;
};

/*
 * The size of the block's labels that appear on top-left and bottom-right of the image
 */
const BLOCK_IMAGE_LABEL_PERCENT = 0.09;

export const WorkingBlockView: React.FC<WorkingBlockViewProps> = memo((props) => {
  const { getWorkingBlock } = useGameStore();
  const { getUpgradeValue } = useUpgrades();
  const { getImage } = useImages();

  // Flag that is set on smaller phones where font size should be adjusted
  const isSmall = props.placement.width < 250;

  const updateWorkingBlock = (chainId: number) => {
    const block = getWorkingBlock(chainId);
    if (block) {
      setWorkingBlock(block);
    }
  };

  const blockSlideLeftAnim = useSharedValue(props.placement.left);
  const blockOpacityAnim = useSharedValue(1);
  useEffect(() => {
    blockSlideLeftAnim.value = props.placement.left;
    blockOpacityAnim.value = 1;
    blockSlideLeftAnim.value = withSequence(
      withTiming(props.placement.left, {
        duration: 400,
        easing: Easing.inOut(Easing.ease),
      }),
      withTiming(props.completedPlacementLeft, { duration: 700 }),
      withTiming(
        props.completedPlacementLeft,
        { duration: 200, easing: Easing.inOut(Easing.ease) },
        () => {
          runOnJS(updateWorkingBlock)(props.chainId);
        },
      ),
      withTiming(props.placement.left, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      }),
      withTiming(props.placement.left, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      }),
    );
    blockOpacityAnim.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(1, { duration: 700 }),
      withTiming(0, { duration: 200 }),
      withTiming(0, { duration: 100 }),
      withTiming(1, { duration: 200 }),
    );
  }, [props.chainId, props.placement.left, props.completedPlacementLeft]);

  const [workingBlock, setWorkingBlock] = React.useState(
    getWorkingBlock(props.chainId),
  );
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: props.placement.top,
        left: blockSlideLeftAnim,
        width: props.placement.width,
        height: props.placement.height,
        opacity: blockOpacityAnim,
        zIndex: 2,
      }}
    >
      {getWorkingBlock(props.chainId)?.isBuilt && (
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            width: props.placement.width,
            height: props.placement.height,
          }}
        >
          <Image
            image={getImage("block.grid.min")}
            fit="fill"
            x={0}
            y={0}
            width={props.placement.width}
            height={
              props.placement.height +
              2 * (props.placement.height * BLOCK_IMAGE_LABEL_PERCENT)
            }
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      )}

      <View
        style={{
          position: "absolute",
          flex: 1,
          padding: 4,
        }}
      >
        <BlockView
          chainId={props.chainId}
          block={getWorkingBlock(props.chainId) || null}
          completed={false}
          showEmptyBlocks={true}
        />
      </View>

      {getWorkingBlock(props.chainId)?.isBuilt && (
        <View
          style={{
            position: "absolute",
            flex: 1,
            width: "100%",
            height: "100%",
          }}
        >
          {props.chainId === 0 ? <Miner /> : <Sequencer />}
        </View>
      )}
    </Animated.View>
  );
});

export default WorkingBlockView;
