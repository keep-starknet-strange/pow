import React, { JSX, useEffect, useLayoutEffect, memo, useRef, useState, useCallback } from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  useAnimatedStyle,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Canvas, Image, FilterMode, MipmapMode } from '@shopify/react-native-skia';
import { View, StyleProp, ViewStyle } from 'react-native';
import { BlockView } from "./BlockView";
import { Miner } from "./Miner";
import { useMiner } from "../hooks/useMiner";
import { Sequencer } from "./Sequencer";
import { useSequencer } from "../hooks/useSequencer";
import { useImages } from "../hooks/useImages";
import { useGameStore } from "../stores/useGameStore";
import { Block } from "../types/Chains";
import { WorkingBlockDetails } from "./WorkingBlockDetails";
import { EmptyBlockView } from "./EmptyBlockView";
import { BlockTxOutlines } from "./BlockTxOutlines";

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
  const onBlockSequenced = useGameStore((state) => state.onBlockSequenced);
  
  const blockShakeAnim = useSharedValue(0);
  
  const triggerBlockShake = useCallback(() => {
    blockShakeAnim.value = withSequence(
      withSpring(-2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(-2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(0, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
    );
  }, [blockShakeAnim]);
  
  const { miningProgress, mineBlock } = useMiner(
    onBlockMined,
    triggerBlockShake
  );
  const { sequencingProgress, sequenceBlock } = useSequencer(
    onBlockSequenced,
    triggerBlockShake
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
        blockShakeAnim={blockShakeAnim}
      />
    );
  }, [props.chainId, workingBlock?.blockId, newBlockInitPosition, blockShakeAnim]);
  const [block0, setBlock0] = useState<JSX.Element | null>(createNewBlockchainBlockView());
  const [block1, setBlock1] = useState<JSX.Element | null>(null);
  const [block2, setBlock2] = useState<JSX.Element | null>(null);
  useEffect(() => {
    // Do the following after anim completes ( 1100ms )
    const updateBlockViews = setTimeout(() => {
      if (workingBlock?.blockId % 3 === 0) {
        setBlock0(createNewBlockchainBlockView());
        setBlock1(null);
      } else if (workingBlock?.blockId % 3 === 1) {
        setBlock1(createNewBlockchainBlockView());
        setBlock2(null);
      } else if (workingBlock?.blockId % 3 === 2) {
        setBlock2(createNewBlockchainBlockView());
        setBlock0(null);
      }
    }, 1100);
    return () => clearTimeout(updateBlockViews);
  }, [createNewBlockchainBlockView, workingBlock?.blockId]);

  const [txSize, setTxSize] = useState<number>(0);
  const txPerRow = workingBlock?.maxSize
    ? Math.sqrt(workingBlock.maxSize) : 4 ** 2;

  useEffect(() => {
    // Account for 4px inset on each side
    const insetWidth = newBlockInitPosition.width - 8;
    setTxSize(insetWidth / txPerRow);
  }, [newBlockInitPosition.width, txPerRow]);

  return (
    <View ref={parentRef} style={props.style}>
      <WorkingBlockDetails
        chainId={props.chainId}
        placement={newBlockInitPosition}
      />
      <View
        style={{
          position: "absolute",
          top: newBlockInitPosition.top + 4,
          left: newBlockInitPosition.left + 4,
          width: newBlockInitPosition.width - 8,
          height: newBlockInitPosition.height - 8,
        }}
      >
        {workingBlock?.blockId !== 0 && (
          <BlockTxOutlines txSize={txSize} txPerRow={txPerRow} />
        )}
      </View>
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
            zIndex: 6,
            transform: [{ scale: 1.25 }], // Miner always used when block scaled
          }}
        >
          {props.chainId === 0 ? (
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
      <EmptyBlockView
        chainId={props.chainId}
        placement={{
          top: newBlockInitPosition.top,
          left: newBlockInitPosition.left + newBlockInitPosition.width + 16,
          width: newBlockInitPosition.width,
          height: newBlockInitPosition.height,
        }}
        completedPlacementLeft={newBlockInitPosition.left}
        showEmpty={!!workingBlock?.blockId}
      />
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
  blockShakeAnim: Animated.SharedValue<number>;
};

export const BlockchainBlockView: React.FC<BlockchainBlockViewProps> = (props) => {
  const { getImage } = useImages();
  const { workingBlocks } = useGameStore();
  const blockHeight = useGameStore((state) => state.blockHeights[props.chainId]);
  const blockSlideLeftAnim = useSharedValue(props.placement.baseLeft);
  const blockScaleAnim = useSharedValue(1);
  const slideOffset = props.placement.width + 16;
  
  const [thisBlock, setThisBlock] = useState<Block | null>(null);
  const [isCurrentWorkingBlock, setIsCurrentWorkingBlock] = useState(blockHeight === props.blockId);
  
  useEffect(() => {
    const block = workingBlocks[props.chainId];
    if (block?.blockId !== props.blockId) {
      return;
    }
    setThisBlock(workingBlocks[props.chainId]);
  }, [props.chainId, workingBlocks, props.blockId]);
  
  // Track if block is built and trigger scale animation
  useEffect(() => {
    if (thisBlock?.isBuilt && props.blockId === blockHeight) {
      blockScaleAnim.value = withSpring(1.25, {
        damping: 4,
        stiffness: 200,
      });
    } else {
      blockScaleAnim.value = withTiming(1, { duration: 400 });
    }
  }, [thisBlock?.isBuilt, blockScaleAnim, blockHeight, props.blockId]);
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
      withTiming(newLeft, { 
        duration: 700 
      }, () => {
        // After slide animation completes, update isCurrentWorkingBlock
        runOnJS(setIsCurrentWorkingBlock)(false);
      })
    );
  }, [blockHeight, props.blockId, props.placement.baseLeft, slideOffset, blockSlideLeftAnim]);

  useEffect(() => {
    const position = blockHeight - (props.blockId || 0);
    if (position !== 0) {
      triggerBlockSlide();
    }
  }, [blockHeight, props.blockId, triggerBlockSlide]);

  const blockTransformStyle = useAnimatedStyle(() => {
    const transforms: any[] = [
      { scale: blockScaleAnim.value }
    ];
    
    // Only apply shake animation if this is the current working block
    if (isCurrentWorkingBlock) {
      transforms.push({ rotate: `${props.blockShakeAnim.value}deg` });
    }
    
    return {
      transform: transforms,
    };
  });

  return (
    <Animated.View
      style={[
        blockTransformStyle,
        {
          position: 'absolute',
          top: props.placement.top,
          left: blockSlideLeftAnim,
          width: props.placement.width,
          height: props.placement.height,
          zIndex: isCurrentWorkingBlock ? 5 : 1,
        }
      ]}
    >
      <BlockView
        chainId={props.chainId}
        block={thisBlock}
        width={props.placement.width}
        height={props.placement.height}
      />
      {!isCurrentWorkingBlock && <BlockConnectors />}
    </Animated.View>
  );
};

export const BlockConnectors: React.FC = memo(() => {
  const { getImage } = useImages();

  return (
    <View
      className="absolute top-0 left-0 w-full h-full"
    >
      <View className="absolute top-[30%] right-[-16px] w-[16px] h-[20px]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("block.connector")}
            fit="fill"
            x={0}
            y={0}
            width={16}
            height={20}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      <View className="absolute bottom-[30%] right-[-16px] w-[16px] h-[20px]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("block.connector")}
            fit="fill"
            x={0}
            y={0}
            width={16}
            height={20}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
    </View>
  );
});
