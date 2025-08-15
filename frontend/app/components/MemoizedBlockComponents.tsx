import React, {
  memo,
  useState,
  useEffect,
  JSX,
  useMemo,
} from "react";
import { View } from "react-native";
import { useGameStore } from "../stores/useGameStore";
import { useMiner } from "../hooks/useMiner";
import { useSequencer } from "../hooks/useSequencer";
import { Miner } from "./Miner";
import { Sequencer } from "./Sequencer";
import { BlockTxOutlines } from "./BlockTxOutlines";

type BlockPlacement = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export const MemoizedBlockContainer = memo(
  ({
    chainId,
    placement,
    createNewBlockchainBlockView,
  }: {
    chainId: number;
    placement: BlockPlacement;
    createNewBlockchainBlockView: () => JSX.Element;
  }) => {
    const workingBlockId = useGameStore(
      (state) => state.workingBlocks[chainId]?.blockId,
    );
    const [block0, setBlock0] = useState<JSX.Element | null>(null);
    const [block1, setBlock1] = useState<JSX.Element | null>(null);
    const [block2, setBlock2] = useState<JSX.Element | null>(null);
    const [previousBlockId, setPreviousBlockId] = useState<number | undefined>(
      undefined,
    );

    useEffect(() => {
      // For initial render or when blockId is undefined/0, render immediately
      if (previousBlockId === undefined || workingBlockId === 0) {
        if (workingBlockId % 3 === 0) {
          setBlock0(createNewBlockchainBlockView());
          setBlock1(null);
        } else if (workingBlockId % 3 === 1) {
          setBlock1(createNewBlockchainBlockView());
          setBlock2(null);
        } else if (workingBlockId % 3 === 2) {
          setBlock2(createNewBlockchainBlockView());
          setBlock0(null);
        }
        setPreviousBlockId(workingBlockId);
        return;
      }

      // For subsequent block changes, use the animation delay
      const updateBlockViews = setTimeout(() => {
        if (workingBlockId % 3 === 0) {
          setBlock0(createNewBlockchainBlockView());
          setBlock1(null);
        } else if (workingBlockId % 3 === 1) {
          setBlock1(createNewBlockchainBlockView());
          setBlock2(null);
        } else if (workingBlockId % 3 === 2) {
          setBlock2(createNewBlockchainBlockView());
          setBlock0(null);
        }
        setPreviousBlockId(workingBlockId);
      }, 1100);
      return () => clearTimeout(updateBlockViews);
    }, [createNewBlockchainBlockView, workingBlockId]);

    return (
      <>
        {block0}
        {block1}
        {block2}
      </>
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

MemoizedBlockContainer.displayName = "MemoizedBlockContainer";

export const MemoizedMinerSequencer = memo(
  ({
    chainId,
    placement,
    triggerBlockShake,
  }: {
    chainId: number;
    placement: BlockPlacement;
    triggerBlockShake: () => void;
  }) => {
    const isBuilt = useGameStore(
      (state) => state.workingBlocks[chainId]?.isBuilt,
    );
    const onBlockMined = useGameStore((state) => state.onBlockMined);
    const onBlockSequenced = useGameStore((state) => state.onBlockSequenced);

    const { mineBlock } = useMiner(
      onBlockMined,
      triggerBlockShake,
    );
    const { sequenceBlock } = useSequencer(
      onBlockSequenced,
      triggerBlockShake,
    );

    if (!isBuilt) return null;

    return (
      <View
        style={{
          position: "absolute",
          top: placement.top,
          left: placement.left,
          width: placement.width,
          height: placement.height,
          zIndex: 6,
          transform: [{ scale: 1.25 }],
        }}
      >
        {chainId === 0 ? (
          <Miner
            triggerAnim={triggerBlockShake}
            mineBlock={mineBlock}
          />
        ) : (
          <Sequencer
            triggerAnim={triggerBlockShake}
            sequenceBlock={sequenceBlock}
          />
        )}
      </View>
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

MemoizedMinerSequencer.displayName = "MemoizedMinerSequencer";

export const MemoizedBlockTxContainer = memo(
  ({ chainId, placement }: { chainId: number; placement: BlockPlacement }) => {
    const blockId = useGameStore(
      (state) => state.workingBlocks[chainId]?.blockId,
    );
    const maxBlockSize = useGameStore(
      (state) => state.workingBlocks[chainId]?.maxSize,
    );

    const txPerRow = useMemo(() => {
      return Math.sqrt(maxBlockSize || 4 ** 2);
    }, [chainId, maxBlockSize]);

    const txSize = useMemo(() => {
      const insetWidth = placement.width - 8;
      return insetWidth / txPerRow;
    }, [placement.width, txPerRow]);

    if (blockId === 0) return null;

    return (
      <View
        style={{
          position: "absolute",
          top: placement.top + 4,
          left: placement.left + 4,
          width: placement.width - 8,
          height: placement.height - 8,
        }}
      >
        <BlockTxOutlines txSize={txSize} txPerRow={txPerRow} />
      </View>
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

MemoizedBlockTxContainer.displayName = "MemoizedBlockTxContainer";
