import React, { useEffect } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { useGame } from "../context/Game";
import { useUpgrades } from "../context/Upgrades";
import { useImages } from "../hooks/useImages";
import { BlockView } from "./BlockView";
import { Miner } from "./Miner";
import { Sequencer } from "./Sequencer";
import Animated, { runOnJS, Easing, useSharedValue, withSequence, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
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

export const WorkingBlockView: React.FC<WorkingBlockViewProps> = (props) => {
  const { workingBlocks, getWorkingBlock } = useGame();
  const { getUpgradeValue } = useUpgrades();
  const { getImage } = useImages();

  // Flag that is set on smaller phones where font size should be adjusted
  const isSmall = props.placement.width < 250;

  const updateWorkingBlock = (chainId: number) => {
    const block = getWorkingBlock(chainId);
    if (block) {
      setWorkingBlock(block);
    }
  }

  const blockSlideLeftAnim = useSharedValue(props.placement.left);
  const blockOpacityAnim = useSharedValue(1);
  useEffect(() => {
    blockSlideLeftAnim.value = props.placement.left;
    blockOpacityAnim.value = 1;
    if (workingBlocks[props.chainId]?.blockId) {
      blockSlideLeftAnim.value = withSequence(
        withSpring(
          props.completedPlacementLeft,
          { duration: 700 }
        ),
        withTiming(
          props.completedPlacementLeft,
          { duration: 200, easing: Easing.inOut(Easing.ease) },
          () => {
            runOnJS(updateWorkingBlock)(props.chainId);
          }
        ),
        withTiming(
          props.placement.left,
          { duration: 100, easing: Easing.inOut(Easing.ease) }
        ),
        withTiming(
          props.placement.left,
          { duration: 200, easing: Easing.inOut(Easing.ease) }
        )
      );
      blockOpacityAnim.value = withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 200 }),
        withTiming(0, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [props.chainId, workingBlocks[props.chainId]?.blockId, props.placement.left, props.completedPlacementLeft]);

  const [workingBlock, setWorkingBlock] = React.useState(
    getWorkingBlock(props.chainId)
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
      }}
    >
      <Canvas
        style={{
          position: "absolute",
          top: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT), // Need to draw outside of view bounds
          width: props.placement.width,
          height:
            props.placement.height +
            2 * (props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
        }}
      >
        <Image
          image={getImage("block.grid")}
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
      <View
        style={{
          position: "absolute",
          flex: 1,
          padding: 4,
          zIndex: 10,
        }}
      >
        <BlockView
          chainId={props.chainId}
          block={workingBlock}
          completed={false}
        />
      </View>

      {workingBlocks[props.chainId]?.isBuilt && (
        <View
          style={{
            position: "absolute",
            flex: 1,
            width: "100%",
            height: "100%",
            zIndex: 15,
          }}
        >
          {props.chainId === 0 ? <Miner /> : <Sequencer />}
        </View>
      )}

      <Text
        style={{
          position: "absolute",
          fontFamily: "Pixels",
          color: "#c3c3c3",
          fontSize: isSmall ? 16 : 18,
          top: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
          paddingLeft: 8,
          paddingTop: 6,
        }}
      >
        Block {workingBlocks[props.chainId]?.blockId}
      </Text>

      <View
        style={{
          flexDirection: "row",
          position: "absolute",
          bottom: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
          right: props.placement.width * 0.27,
          paddingRight: 4,
          paddingBottom: 5,
        }}
      >
        <AnimatedRollingNumber
          value={workingBlocks[props.chainId]?.transactions.length}
          textStyle={{
            fontSize: isSmall ? 16 : 20,
            color: "#c3c3c3",
            fontFamily: "Pixels",
          }}
          spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
        />
        <Text
          style={{
            fontSize: isSmall ? 16 : 20,
          }}
          className="text-[#c3c3c3] font-Pixels"
        >
          /{getUpgradeValue(props.chainId, "Block Size") ** 2}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
          right: 0,
          paddingRight: 4,
          paddingBottom: 5,
        }}
      >
        <AnimatedRollingNumber
          value={
            workingBlocks[props.chainId]?.fees +
            (workingBlocks[props.chainId]?.reward ||
              getUpgradeValue(props.chainId, "Block Reward"))
          }
          enableCompactNotation
          compactToFixed={1}
          textStyle={{
            fontSize: isSmall ? 18 : 20,
            color: "#fff2fdff",
            fontFamily: "Pixels",
          }}
          spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
        />
      </View>
    </Animated.View>
  );
};

export default WorkingBlockView;
