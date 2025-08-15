import React, { memo, useEffect, useCallback, useMemo } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useImages } from "../hooks/useImages";
import Animated, {
  runOnJS,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
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

const BlockCanvas = memo(
  ({ placement }: { placement: { width: number; height: number } }) => {
    const { getImage } = useImages();

    const canvasStyle = useMemo(
      () => ({
        position: "absolute" as const,
        top: -(placement.height * BLOCK_IMAGE_LABEL_PERCENT),
        width: placement.width,
        height:
          placement.height + 2 * (placement.height * BLOCK_IMAGE_LABEL_PERCENT),
      }),
      [placement.width, placement.height],
    );

    const imageHeight = useMemo(
      () =>
        placement.height + 2 * (placement.height * BLOCK_IMAGE_LABEL_PERCENT),
      [placement.height],
    );

    return (
      <Canvas style={canvasStyle}>
        <Image
          image={getImage("block.grid")}
          fit="fill"
          x={0}
          y={0}
          width={placement.width}
          height={imageHeight}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
    );
  },
);

BlockCanvas.displayName = "BlockCanvas";

const BlockIdLabel = memo(
  ({ blockId, isSmall }: { blockId: number; isSmall: boolean }) => {
    const textStyle = useMemo(
      () => ({
        color: "#c3c3c3",
        fontFamily: "Pixels" as const,
        fontSize: isSmall ? 16 : 18,
      }),
      [isSmall],
    );

    const animConfig = useMemo(
      () => ({
        duration: 400,
        easing: Easing.bounce,
      }),
      [],
    );

    if (blockId >= 10) {
      return (
        <>
          <Text style={textStyle}>#</Text>
          <AnimatedRollingNumber
            value={blockId}
            textStyle={textStyle}
            spinningAnimationConfig={animConfig}
          />
        </>
      );
    }

    return (
      <>
        <Text style={textStyle}>Block&nbsp;</Text>
        <AnimatedRollingNumber
          value={blockId}
          textStyle={textStyle}
          spinningAnimationConfig={animConfig}
        />
      </>
    );
  },
);

BlockIdLabel.displayName = "BlockIdLabel";

const TransactionCount = memo(
  ({
    transactionCount,
    maxSize,
    isSmall,
  }: {
    transactionCount: number;
    maxSize: number;
    isSmall: boolean;
  }) => {
    const textStyle = useMemo(
      () => ({
        fontSize: isSmall ? 16 : 18,
        color: "#c3c3c3",
        fontFamily: "Pixels" as const,
      }),
      [isSmall],
    );

    const animConfig = useMemo(
      () => ({
        duration: 400,
        easing: Easing.bounce,
      }),
      [],
    );

    return (
      <>
        <AnimatedRollingNumber
          value={transactionCount}
          enableCompactNotation
          compactToFixed={2}
          textStyle={textStyle}
          spinningAnimationConfig={animConfig}
        />
        <Text
          style={{
            fontSize: isSmall ? 16 : 18,
            color: "#c3c3c3",
            fontFamily: "Pixels" as const,
          }}
          >
          /{maxSize}
        </Text>
      </>
    );
  },
);

TransactionCount.displayName = "TransactionCount";

const BlockReward = memo(
  ({ reward, isSmall }: { reward: number; isSmall: boolean }) => {
          const textStyle = useMemo(
        () => ({
          fontSize: isSmall ? 14 : 18,
          color: "#fff2fdff",
          fontFamily: "Pixels" as const,
          marginBottom: isSmall ? 2 : 0,
          alignItems: "flex-end" as const,

        }),
        [isSmall],
    );

    const animConfig = useMemo(
      () => ({
        duration: 400,
        easing: Easing.bounce,
      }),
      [],
    );

    // TODO: this gets the correct number of decimals for the compact notation
    const toFixed = (value: number) => {
      const length = value.toString().length;
      if (length % 3 === 0) return 0;
      return 1;
    };

    return (
      <AnimatedRollingNumber
        value={reward}
        enableCompactNotation
        toFixed={toFixed(reward)}
        textStyle={textStyle}
        spinningAnimationConfig={animConfig}
      />
    );
  },
);

BlockReward.displayName = "BlockReward";

export const WorkingBlockDetails: React.FC<WorkingBlockDetailsProps> = memo(
  (props) => {
    const { getUpgradeValue } = useUpgrades();
    const { workingBlocks } = useGameStore();
    const workingBlockData = workingBlocks[props.chainId];

    const isSmall = useMemo(
      () => props.placement.width < 250,
      [props.placement.width],
    );

    const [workingBlock, setWorkingBlock] = React.useState(workingBlockData);

    const updateWorkingBlock = useCallback(() => {
      if (workingBlockData) {
        setWorkingBlock(workingBlockData);
      }
    }, [workingBlockData]);

    const detailsScaleAnim = useSharedValue(1);
    useEffect(() => {
      if (workingBlockData?.isBuilt) {
        detailsScaleAnim.value = withSpring(1.25, {
          damping: 4,
          stiffness: 200,
        });
      } else {
        if (!workingBlockData?.blockId) {
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
      workingBlockData?.isBuilt,
      workingBlockData?.blockId,
      updateWorkingBlock,
    ]);

    const containerStyle = useMemo(
      () => ({
        position: "absolute" as const,
        top: props.placement.top,
        left: props.placement.left,
        width: props.placement.width,
        height: props.placement.height,
        transform: [{ scale: detailsScaleAnim }],
      }),
      [
        props.placement.top,
        props.placement.left,
        props.placement.width,
        props.placement.height,
      ],
    );

    const blockIdLabelStyle = useMemo(
      () => ({
        top: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
      }),
      [props.placement.height],
    );

    const transactionCountStyle = useMemo(
      () => ({
        flexDirection: "row" as const,
        position: "absolute" as const,
        bottom: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
        left: props.placement.width * 0.49,
        paddingRight: 4,
        paddingBottom: 6,
        transform: props.chainId === 1 ? [{ translateY: 2 }] : undefined,
      }),
      [props.placement.height, props.placement.width, props.chainId],
    );

    const rewardStyle = useMemo(
      () => ({
        position: "absolute" as const,
        bottom: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
        left: props.placement.width * 0.81,
        paddingRight: 4,
        paddingBottom: 6,
        // For L2 (chainId 1), add a small downward adjustment to prevent being pushed up
        transform: props.chainId === 1 ? [{ translateY: 2 }] : undefined,
      }),
      [props.placement.height, props.placement.width, props.chainId],
    );

    const maxSize = useMemo(
      () =>
        workingBlockData?.maxSize ||
        getUpgradeValue(props.chainId, "Block Size") ** 2,
      [workingBlockData?.maxSize, getUpgradeValue, props.chainId],
    );

    const totalReward = useMemo(
      () =>
        (workingBlock?.fees || 0) +
        (workingBlock?.reward ||
          0 ||
          getUpgradeValue(props.chainId, "Block Reward")),
      [
        workingBlock?.fees,
        workingBlock?.reward,
        getUpgradeValue,
        props.chainId,
      ],
    );

    return (
      <Animated.View style={containerStyle}>
        <BlockCanvas placement={props.placement} />

        <View
          className="absolute flex flex-row pl-2 pt-2"
          style={blockIdLabelStyle}
        >
          <BlockIdLabel
            blockId={workingBlock?.blockId || 0}
            isSmall={isSmall}
          />
        </View>

        <View style={transactionCountStyle}>
          <TransactionCount
            transactionCount={workingBlock?.transactions.length || 0}
            maxSize={maxSize}
            isSmall={isSmall}
          />
        </View>

        <View style={rewardStyle}>
          <BlockReward reward={totalReward} isSmall={isSmall} />
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
      prevProps.placement.height === nextProps.placement.height
    );
  },
);

WorkingBlockDetails.displayName = "WorkingBlockDetails";

export default WorkingBlockDetails;
