import React, { JSX, useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { View, StyleProp, ViewStyle } from 'react-native';
import { BlockView } from "./BlockView";
import { Miner } from "./Miner";
import { useMiner } from "../hooks/useMiner";
import { useGameStore } from "../stores/useGameStore";
import { Block } from "../types/Chains";

/*
 * The size of the block proportional to the smallest available dimension.
 */
const BLOCK_SIZE_PERCENT = 0.7;

export type BlockchainView2Props = {
  chainId: number;
  style: StyleProp<ViewStyle>;
};

export const BlockchainView2: React.FC<BlockchainView2Props> = (props) => {
  const workingBlock = useGameStore((state => state.workingBlocks[props.chainId]));
  const parentRef = useRef<View>(null);
  const [parentSize, setParentSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    parentRef.current?.measure((_x, _y, width, height, _pageX, _pageY) => {
      setParentSize({ width: width, height: height });
    });
  }, [parentRef, setParentSize]);

  const [newBlockInitPosition, setNewBlockInitPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const smallestViewportSize = Math.min(parentSize.width, parentSize.height);
    const size = smallestViewportSize * BLOCK_SIZE_PERCENT;
    const blockSize = {
      top: (parentSize.height - size) / 2,
      left: (parentSize.width - size) / 2,
      width: size,
      height: size,
    };

    setNewBlockInitPosition(blockSize);
  }, [parentSize, BLOCK_SIZE_PERCENT]);

  const onBlockMined = useGameStore((state) => state.onBlockMined);
  const { miningProgress, mineBlock } = useMiner(
    onBlockMined,
    undefined
  );
  const createNewBlockchainBlockView = useCallback(() => {
    return (
      <BlockchainBlockView
        chainId={props.chainId}
        blockId={workingBlock?.blockId || 0}
        placement={{
          top: newBlockInitPosition.top,
          baseLeft: newBlockInitPosition.left,
          width: newBlockInitPosition.width,
          height: newBlockInitPosition.height,
        }}
      />
    );
  }, [props.chainId, workingBlock?.blockId, newBlockInitPosition]);
  const [block0, setBlock0] = useState(createNewBlockchainBlockView());
  const [block1, setBlock1] = useState<JSX.Element | null>(null);
  const [block2, setBlock2] = useState<JSX.Element | null>(null);
  useEffect(() => {
    if (workingBlock?.blockId % 3 === 0) {
      setBlock0(createNewBlockchainBlockView());
    } else if (workingBlock?.blockId % 3 === 1) {
      setBlock1(createNewBlockchainBlockView());
    } else if (workingBlock?.blockId % 3 === 2) {
      setBlock2(createNewBlockchainBlockView());
    }
  }, [createNewBlockchainBlockView, workingBlock?.blockId]);

  return (
    <View ref={parentRef} style={props.style}>
      {block0}
      {block1}
      {block2}
      {workingBlock?.isBuilt && (
        <View
          style={{
            position: "absolute",
            top: newBlockInitPosition.top,
            left: newBlockInitPosition.left,
            width: newBlockInitPosition.width,
            height: newBlockInitPosition.height,
          }}
        >
          <Miner
            triggerAnim={() => {}}
            miningProgress={miningProgress}
            mineBlock={mineBlock}
          />
        </View>
      )}
    </View>
  );
};

export type BlockchainBlockViewProps = {
  chainId: number;
  blockId: number;
  placement: {
    top: number;
    baseLeft: number;
    width: number;
    height: number;
  };
};

export const BlockchainBlockView: React.FC<BlockchainBlockViewProps> = (props) => {
  const { workingBlocks } = useGameStore();
  const [thisBlock, setThisBlock] = useState<Block | null>(null);
  useEffect(() => {
    const block = workingBlocks[props.chainId];
    if (block?.blockId !== props.blockId) {
      return;
    }
    setThisBlock(workingBlocks[props.chainId]);
  }, [props.chainId, workingBlocks, props.blockId]);
  const blockHeight = useGameStore((state) => state.blockHeights[props.chainId]);
  const blockSlideLeftAnim = useSharedValue(props.placement.baseLeft);
  const slideOffset = props.placement.width + 16;
  useEffect(() => {
    const position = blockHeight - (props.blockId || 0);
    blockSlideLeftAnim.value = props.placement.baseLeft - (position * slideOffset);
  }, [props.blockId, props.placement.baseLeft, slideOffset]);

  const triggerBlockSlide = useCallback(() => {
    const position = blockHeight - (props.blockId || 0);
    const currLeft = props.placement.baseLeft - (Math.max(position - 1, 0) * slideOffset);
    const newLeft = props.placement.baseLeft - (position * slideOffset);
    blockSlideLeftAnim.value = withSequence(
      withTiming(currLeft, { // Wait 400ms
        duration: 400
      }),
      withTiming(newLeft, { duration: 700 }),
    );
  }, [blockHeight, props.blockId, props.placement.baseLeft, slideOffset, blockSlideLeftAnim]);

  useEffect(() => {
    const position = blockHeight - (props.blockId || 0);
    if (position !== 0) {
      triggerBlockSlide();
    }
  }, [blockHeight, props.blockId, triggerBlockSlide]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: props.placement.top,
        left: blockSlideLeftAnim,
        width: props.placement.width,
        height: props.placement.height,
      }}
    >
      <BlockView
        chainId={props.chainId}
        block={thisBlock}
        completed={false}
        showTxOutlines={props.blockId !== 0}
      />
    </Animated.View>
  );
};
