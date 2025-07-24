import React, { useEffect } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useUpgrades } from "../stores/useUpgradesStore";
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

  const detailsScaleAnim = useSharedValue(1);
  useEffect(() => {
    detailsScaleAnim.value = 1;
    detailsScaleAnim.value = withSequence(
      withTiming(1.05, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      withTiming(
        1.05,
        { duration: 900, easing: Easing.inOut(Easing.ease) },
        () => runOnJS(updateWorkingBlock)(props.chainId),
      ),
      withSpring(1, { damping: 2, stiffness: 100 }),
    );
  }, [props.chainId]);

  const [workingBlock, setWorkingBlock] = React.useState(
    getWorkingBlock(props.chainId),
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
        <Text
          style={{
            color: "#c3c3c3",
            fontFamily: "Pixels",
            fontSize: isSmall ? 16 : 14,
          }}
        >
          Block&nbsp;
        </Text>
        <AnimatedRollingNumber
          value={getWorkingBlock(props.chainId)?.blockId || 0}
          textStyle={{
            fontSize: isSmall ? 16 : 18,
            color: "#c3c3c3",
            fontFamily: "Pixels",
          }}
          spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
        />
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
          value={getWorkingBlock(props.chainId)?.transactions.length || 0}
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
          /{getUpgradeValue(props.chainId, "Block Size") ** 2}
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
            (getWorkingBlock(props.chainId)?.fees || 0) +
            (getWorkingBlock(props.chainId)?.reward ||
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
