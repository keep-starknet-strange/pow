import React, { memo, useEffect, useCallback } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
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
  workingBlockData: {
    blockId: number;
    isBuilt: boolean;
    transactions: any[];
    fees: number;
    maxSize: number;
    reward?: number;
  } | null;
};

/*
 * The size of the block's labels that appear on top-left and bottom-right of the image
 */
const BLOCK_IMAGE_LABEL_PERCENT = 0.09;

export const WorkingBlockDetails: React.FC<WorkingBlockDetailsProps> = memo(
  (props) => {
    const { getUpgradeValue } = useUpgrades();
    const { getImage } = useImages();

    // Flag that is set on smaller phones where font size should be adjusted
    const isSmall = props.placement.width < 250;

    const [workingBlock, setWorkingBlock] = React.useState(
      props.workingBlockData,
    );

    const updateWorkingBlock = useCallback(() => {
      if (props.workingBlockData) {
        setWorkingBlock(props.workingBlockData);
      }
    }, [props.workingBlockData]);

    const detailsScaleAnim = useSharedValue(1);
    useEffect(() => {
      if (props.workingBlockData?.isBuilt) {
        detailsScaleAnim.value = withSpring(1.25, {
          damping: 4,
          stiffness: 200,
        });
      } else {
        if (!props.workingBlockData?.blockId) {
          detailsScaleAnim.value = 1;
          return;
        }
        detailsScaleAnim.value = withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(1, { duration: 900 }, () => runOnJS(updateWorkingBlock)()),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        );
      }
    }, [
      props.workingBlockData?.isBuilt,
      props.workingBlockData?.blockId,
      updateWorkingBlock,
    ]);

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
                spinningAnimationConfig={{
                  duration: 400,
                  easing: Easing.bounce,
                }}
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
                spinningAnimationConfig={{
                  duration: 400,
                  easing: Easing.bounce,
                }}
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
            {props.workingBlockData?.maxSize ||
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.chainId === nextProps.chainId &&
      prevProps.placement.top === nextProps.placement.top &&
      prevProps.placement.left === nextProps.placement.left &&
      prevProps.placement.width === nextProps.placement.width &&
      prevProps.placement.height === nextProps.placement.height &&
      prevProps.workingBlockData?.blockId ===
        nextProps.workingBlockData?.blockId &&
      prevProps.workingBlockData?.isBuilt ===
        nextProps.workingBlockData?.isBuilt &&
      prevProps.workingBlockData?.transactions.length ===
        nextProps.workingBlockData?.transactions.length &&
      prevProps.workingBlockData?.fees === nextProps.workingBlockData?.fees &&
      prevProps.workingBlockData?.maxSize ===
        nextProps.workingBlockData?.maxSize &&
      prevProps.workingBlockData?.reward === nextProps.workingBlockData?.reward
    );
  },
);

WorkingBlockDetails.displayName = "WorkingBlockDetails";

export default WorkingBlockDetails;
