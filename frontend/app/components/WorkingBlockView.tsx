import React, { memo, useEffect, useCallback } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { Block } from "../types/Chains";
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
  workingBlock: Block | undefined;
  onBlockMined?: () => void;
  onBlockSequenced?: () => void;
};

/*
 * The size of the block's labels that appear on top-left and bottom-right of the image
 */
const BLOCK_IMAGE_LABEL_PERCENT = 0.09;

export const WorkingBlockView: React.FC<WorkingBlockViewProps> = memo(
  (props) => {
    const { getImage } = useImages();

    // Flag that is set on smaller phones where font size should be adjusted
    const isSmall = props.placement.width < 250;

    const [workingBlock, setWorkingBlock] = React.useState(
      props.workingBlock || null,
    );

    const updateWorkingBlock = useCallback(() => {
      if (props.workingBlock) {
        setWorkingBlock(props.workingBlock);
      }
    }, [props.workingBlock]);

    // Block complete anim sequence
    const blockScaleAnim = useSharedValue(1);
    const blockSlideLeftAnim = useSharedValue(props.placement.left);
    const blockOpacityAnim = useSharedValue(1);
    const blockShakeAnim = useSharedValue(0);
    useEffect(() => {
      if (props.workingBlock?.isBuilt) {
        blockSlideLeftAnim.value = props.placement.left;
        blockOpacityAnim.value = 1;
        blockScaleAnim.value = withSpring(1.25, {
          damping: 4,
          stiffness: 200,
        });
      } else {
        if (!props.workingBlock?.blockId) {
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
              runOnJS(updateWorkingBlock)();
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
      props.workingBlock?.isBuilt,
      props.workingBlock?.blockId,
      props.placement.left,
      props.completedPlacementLeft,
      updateWorkingBlock,
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
    const { miningProgress, mineBlock } = useMiner(
      props.onBlockMined || (() => {}),
      props.onBlockMined ? triggerBlockShake : undefined,
    );
    const { sequencingProgress, sequenceBlock } = useSequencer(
      props.onBlockSequenced || (() => {}),
      props.onBlockSequenced ? triggerBlockShake : undefined,
    );
    const blockTransformStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: blockScaleAnim.value },
          { rotate: `${blockShakeAnim.value}deg` },
        ],
      };
    });

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
            showTxOutlines={workingBlock?.blockId !== 0}
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
            {props.onBlockMined ? (
              <Miner
                triggerAnim={triggerBlockShake}
                miningProgress={miningProgress}
                mineBlock={mineBlock}
              />
            ) : (
              <Sequencer
                triggerAnim={triggerBlockShake}
                sequencingProgress={sequencingProgress}
                sequenceBlock={sequenceBlock}
              />
            )}
          </View>
        )}
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.chainId === nextProps.chainId &&
      prevProps.placement.top === nextProps.placement.top &&
      prevProps.placement.left === nextProps.placement.left &&
      prevProps.placement.width === nextProps.placement.width &&
      prevProps.placement.height === nextProps.placement.height &&
      prevProps.completedPlacementLeft === nextProps.completedPlacementLeft &&
      prevProps.workingBlock?.blockId === nextProps.workingBlock?.blockId &&
      prevProps.workingBlock?.isBuilt === nextProps.workingBlock?.isBuilt &&
      prevProps.workingBlock?.transactions.length ===
        nextProps.workingBlock?.transactions.length &&
      prevProps.workingBlock?.fees === nextProps.workingBlock?.fees
    );
  },
);

export default WorkingBlockView;
