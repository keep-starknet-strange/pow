import React, { useEffect } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useShallow } from "zustand/react/shallow";
import { useImages } from "../hooks/useImages";
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

export type WorkingBlockDetailsProps = {
  chainId: number;
  placement: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

/*
 * The size of the block's labels that appear on top-left and bottom-right of the image
 */
const BLOCK_IMAGE_LABEL_PERCENT = 0.09;

export const WorkingBlockDetails: React.FC<WorkingBlockDetailsProps> = (
  props,
) => {
  // Shallow state management: only re-render when this specific chainId's block changes
  const currentWorkingBlock = useGameStore(
    useShallow((state) => state.workingBlocks[props.chainId]),
  );
  const { getUpgradeValue } = useUpgrades();
  const { getImage } = useImages();

  // Flag that is set on smaller phones where font size should be adjusted
  const isSmall = props.placement.width < 250;

  const updateWorkingBlock = (chainId: number) => {
    if (currentWorkingBlock) {
      setWorkingBlock(currentWorkingBlock);
    }
  };

  const detailsScaleAnim = useSharedValue(1);
  useEffect(() => {
    if (currentWorkingBlock?.isBuilt) {
      detailsScaleAnim.value = withSpring(1.25, {
        damping: 4,
        stiffness: 200,
      });
    } else {
      if (!currentWorkingBlock?.blockId) {
        detailsScaleAnim.value = 1;
        return;
      }
      detailsScaleAnim.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1, { duration: 900 }, () =>
          runOnJS(updateWorkingBlock)(props.chainId),
        ),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      );
    }
  }, [props.chainId, currentWorkingBlock?.isBuilt]);

  const [workingBlock, setWorkingBlock] = React.useState(
    currentWorkingBlock || null,
  );

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: props.placement.top,
        left: props.placement.left,
        width: props.placement.width,
        height: props.placement.height,
        transform: [{ scale: detailsScaleAnim }],
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
        className="absolute flex flex-row pl-2 pt-2"
        style={{
          top: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
        }}
      >
        {(workingBlock?.blockId || 0) >= 10 ? (
          // For multi-digit block numbers, show "#{number}"
          <>
            <Text
              style={{
                color: "#c3c3c3",
                fontFamily: "Pixels",
                fontSize: isSmall ? 16 : 18,
              }}
            >
              #
            </Text>
            <AnimatedRollingNumber
              value={workingBlock?.blockId || 0}
              textStyle={{
                fontSize: isSmall ? 16 : 18,
                color: "#c3c3c3",
                fontFamily: "Pixels",
              }}
              spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
            />
          </>
        ) : (
          // For single-digit block numbers, show "Block {number}"
          <>
            <Text
              style={{
                color: "#c3c3c3",
                fontFamily: "Pixels",
                fontSize: isSmall ? 16 : 18,
              }}
            >
              Block&nbsp;
            </Text>
            <AnimatedRollingNumber
              value={workingBlock?.blockId || 0}
              textStyle={{
                fontSize: isSmall ? 16 : 18,
                color: "#c3c3c3",
                fontFamily: "Pixels",
              }}
              spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
            />
          </>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          position: "absolute",
          bottom: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
          left: props.placement.width * 0.49,
          paddingRight: 4,
          paddingBottom: 6,
        }}
      >
        <AnimatedRollingNumber
          value={workingBlock?.transactions.length || 0}
          enableCompactNotation
          compactToFixed={2}
          textStyle={{
            fontSize: isSmall ? 16 : 18,
            color: "#c3c3c3",
            fontFamily: "Pixels",
          }}
          spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
        />
        <Text
          style={{
            fontSize: isSmall ? 16 : 18,
          }}
          className="text-[#c3c3c3] font-Pixels"
        >
          /
          {currentWorkingBlock?.maxSize ||
            getUpgradeValue(props.chainId, "Block Size") ** 2}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
          left: props.placement.width * 0.81,
          paddingRight: 4,
          paddingBottom: 6,
        }}
      >
        <AnimatedRollingNumber
          value={
            (workingBlock?.fees || 0) +
            (workingBlock?.reward ||
              0 ||
              getUpgradeValue(props.chainId, "Block Reward"))
          }
          enableCompactNotation
          compactToFixed={1}
          textStyle={{
            fontSize: isSmall ? 18 : 18,
            color: "#fff2fdff",
            fontFamily: "Pixels",
          }}
          spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
        />
      </View>
    </Animated.View>
  );
};

export default WorkingBlockDetails;
