import React, { memo, useEffect, useCallback, useMemo } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useImages } from "../hooks/useImages";
import Animated, {
  runOnJS,
  Easing,
  useSharedValue,
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
  ({
    blockId,
    blockSizeType,
  }: {
    blockId: number;
    blockSizeType: BlockSizeType;
  }) => {
    const textStyle = useMemo(
      () => ({
        color: "#c3c3c3",
        fontFamily: "Pixels" as const,
        fontSize: BlockSizeUtil.selector(blockSizeType, 16, 14, 10),
        includeFontPadding: false,
        textAlignVertical: "center" as const,
      }),
      [blockSizeType],
    );

    const animConfig = useMemo(
      () => ({
        duration: 400,
        easing: Easing.bounce,
      }),
      [],
    );

    if (blockId >= 100) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Text style={textStyle}>#</Text>
          <AnimatedRollingNumber
            value={blockId}
            textStyle={textStyle}
            spinningAnimationConfig={animConfig}
          />
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Text style={textStyle}>Block&nbsp;</Text>
        <AnimatedRollingNumber
          value={blockId}
          textStyle={textStyle}
          spinningAnimationConfig={animConfig}
        />
      </View>
    );
  },
);

BlockIdLabel.displayName = "BlockIdLabel";

const TransactionCount = memo(
  ({
    transactionCount,
    maxSize,
    blockSizeType,
  }: {
    transactionCount: number;
    maxSize: number;
    blockSizeType: BlockSizeType;
  }) => {
    const textStyle = useMemo(
      () => ({
        fontSize: BlockSizeUtil.selector(blockSizeType, 18, 16, 8),
        color: "#c3c3c3",
        fontFamily: "Pixels" as const,
      }),
      [blockSizeType],
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
            fontSize: BlockSizeUtil.selector(blockSizeType, 18, 16, 8),
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
  ({
    reward,
    blockSizeType,
  }: {
    reward: number;
    blockSizeType: BlockSizeType;
  }) => {
    const textStyle = useMemo(
      () => ({
        fontSize: BlockSizeUtil.selector(blockSizeType, 18, 14, 8),
        color: "#fff2fdff",
        fontFamily: "Pixels" as const,
        marginBottom: BlockSizeUtil.selector(blockSizeType, 2, 2, 4),
        alignItems: "flex-end" as const,
      }),
      [blockSizeType],
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

enum BlockSizeType {
  Normal,
  Small,
  Tiny,
}

class BlockSizeUtil {
  public static selector(
    type: BlockSizeType,
    normal: number,
    small: number,
    tiny: number,
  ) {
    if (type === BlockSizeType.Normal) {
      return normal;
    } else if (type === BlockSizeType.Small) {
      return small;
    } else {
      return tiny;
    }
  }
}

export const WorkingBlockDetails: React.FC<WorkingBlockDetailsProps> = memo(
  (props) => {
    const { getUpgradeValue } = useUpgrades();
    const { workingBlocks } = useGameStore();
    const workingBlockData = workingBlocks[props.chainId];

    const blockSizeType = useMemo(() => {
      if (props.placement.width < 200) {
        return BlockSizeType.Tiny;
      } else if (props.placement.width < 250) {
        return BlockSizeType.Small;
      } else {
        return BlockSizeType.Normal;
      }
    }, [props.placement.width]);

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
        if (workingBlockData?.blockId !== workingBlock?.blockId) {
          updateWorkingBlock();
          return;
        }
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
        width: props.placement.width * 0.35,
        height: props.placement.height * BLOCK_IMAGE_LABEL_PERCENT,
        top: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
        paddingTop: BlockSizeUtil.selector(blockSizeType, 2, 2, 1),
        paddingBottom: BlockSizeUtil.selector(blockSizeType, 2, 2, 1),
        paddingLeft: BlockSizeUtil.selector(blockSizeType, 4, 3, 2),
        paddingRight: BlockSizeUtil.selector(blockSizeType, 2, 2, 1),
        overflow: "hidden" as const,
      }),
      [blockSizeType, props.placement.width, props.placement.height],
    );

    const transactionCountStyle = useMemo(
      () => ({
        flexDirection: "row" as const,
        position: "absolute" as const,
        bottom: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
        left: props.placement.width * 0.49,
        paddingRight: 4,
        paddingBottom: BlockSizeUtil.selector(blockSizeType, 6, 4, 6),
        transform: props.chainId === 1 ? [{ translateY: 2 }] : undefined,
      }),
      [
        blockSizeType,
        props.placement.height,
        props.placement.width,
        props.chainId,
      ],
    );

    const rewardStyle = useMemo(
      () => ({
        position: "absolute" as const,
        bottom: -(props.placement.height * BLOCK_IMAGE_LABEL_PERCENT),
        left: props.placement.width * 0.81,
        paddingRight: 4,
        paddingBottom: BlockSizeUtil.selector(blockSizeType, 6, 4, 2),
        // For L2 (chainId 1), add a small downward adjustment to prevent being pushed up
        transform: props.chainId === 1 ? [{ translateY: 2 }] : undefined,
      }),
      [
        blockSizeType,
        props.placement.height,
        props.placement.width,
        props.chainId,
      ],
    );

    const maxSize = useMemo(
      () =>
        workingBlock?.maxSize ||
        getUpgradeValue(props.chainId, "Block Size") ** 2,
      [workingBlock?.maxSize, getUpgradeValue, props.chainId],
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

        <View className="absolute" style={blockIdLabelStyle}>
          <View className="flex-1 flex-row">
            <BlockIdLabel
              blockId={workingBlock?.blockId || 0}
              blockSizeType={blockSizeType}
            />
          </View>
        </View>

        <View style={transactionCountStyle}>
          <TransactionCount
            transactionCount={workingBlock?.transactions.length || 0}
            maxSize={maxSize}
            blockSizeType={blockSizeType}
          />
        </View>

        <View style={rewardStyle}>
          <BlockReward reward={totalReward} blockSizeType={blockSizeType} />
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
