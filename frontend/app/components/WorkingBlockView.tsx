import React, { memo, useEffect } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useImages } from "../hooks/useImages";
import { useMiner } from "../hooks/useMiner";
import { useSequencer } from "../hooks/useSequencer";
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

export const WorkingBlockView: React.FC<WorkingBlockViewProps> = memo(
  (props) => {
    const { workingBlocks, onBlockMined, onBlockSequenced } = useGameStore();
    const { getImage } = useImages();

    // Flag that is set on smaller phones where font size should be adjusted
    const isSmall = props.placement.width < 250;

    const updateWorkingBlock = (chainId: number) => {
      const block = workingBlocks[chainId];
      if (block) {
        setWorkingBlock(block);
      }
    };

    // Block complete anim sequence
    const blockScaleAnim = useSharedValue(1);
    const blockSlideLeftAnim = useSharedValue(props.placement.left);
    const blockOpacityAnim = useSharedValue(1);
    const blockShakeAnim = useSharedValue(0);
    useEffect(() => {
      if (workingBlocks[props.chainId]?.isBuilt) {
        blockSlideLeftAnim.value = props.placement.left;
        blockOpacityAnim.value = 1;
        blockScaleAnim.value = withSpring(1.25, {
          damping: 4,
          stiffness: 200,
        });
      } else {
        if (!workingBlocks[props.chainId]?.blockId) {
          blockScaleAnim.value = 1;
          blockSlideLeftAnim.value = props.placement.left;
          blockOpacityAnim.value = 1;
          blockShakeAnim.value = 0;
          return;
        }
        blockScaleAnim.value = withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(1, { duration: 700 }),
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        );
        blockSlideLeftAnim.value = withSequence(
          withTiming(props.placement.left, {
            duration: 400,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(props.completedPlacementLeft, { duration: 700 }),
          withTiming(
            props.completedPlacementLeft,
            {
              duration: 200,
              easing: Easing.inOut(Easing.ease),
            },
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
      }
    }, [
      props.chainId,
      workingBlocks[props.chainId]?.isBuilt,
      props.placement.left,
      props.completedPlacementLeft,
    ]);

    // Block clicked (mine/sequencer) anim sequence
    const triggerBlockShake = () => {
      blockShakeAnim.value = withSequence(
        withSpring(-2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
        withSpring(2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
        withSpring(-2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
        withSpring(0, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      );
      /*
      blockScaleAnim.value = withSequence(
        withSpring(1.22, { duration: 150, dampingRatio: 0.5, stiffness: 100 }),
        withSpring(1.28, { duration: 150, dampingRatio: 0.5, stiffness: 100 }),
        withSpring(1.25, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      );
      */
    };

    // Use hooks with animation callbacks for automation
    const { mineBlock } = useMiner(
      props.chainId === 0 ? onBlockMined : () => {},
      props.chainId === 0 ? triggerBlockShake : undefined,
    );
    const { sequenceBlock } = useSequencer(
      props.chainId === 1 ? onBlockSequenced : () => {},
      props.chainId === 1 ? triggerBlockShake : undefined,
    );
    const blockTransformStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: blockScaleAnim.value },
          { rotate: `${blockShakeAnim.value}deg` },
        ],
      };
    });

    const [workingBlock, setWorkingBlock] = React.useState(
      workingBlocks[props.chainId] || null,
    );
    return (
      <Animated.View
        style={[
          blockTransformStyle,
          {
            position: "absolute",
            top: props.placement.top,
            left: blockSlideLeftAnim,
            width: props.placement.width,
            height: props.placement.height,
            opacity: blockOpacityAnim,
            zIndex: 2,
          },
        ]}
      >
        {workingBlock?.isBuilt && (
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
              height={props.placement.height}
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
            block={workingBlock || null}
            completed={false}
            showEmptyBlocks={true}
          />
        </View>

        {workingBlock?.isBuilt && (
          <View
            style={{
              position: "absolute",
              flex: 1,
              width: "100%",
              height: "100%",
            }}
          >
            {props.chainId === 0 ? (
              <Miner triggerAnim={triggerBlockShake} mineBlock={mineBlock} />
            ) : (
              <Sequencer
                triggerAnim={triggerBlockShake}
                sequenceBlock={sequenceBlock}
              />
            )}
          </View>
        )}
      </Animated.View>
    );
  },
);

export default WorkingBlockView;
