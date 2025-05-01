import { useMemo } from 'react';
import { newBlock, Block } from '../types/Chains';

export function useVisibleBlocks(
  createdAtSec: number,
  tick: number,
  windowSize: number
): [Block[], number] {
  return useMemo(() => {
    const elapsed = Math.max(0, Math.floor(Date.now() / 1000) - createdAtSec);
    const blocksShown = Math.min(windowSize, elapsed);
    const visibleBlocks: Block[] = Array.from(
      { length: blocksShown },
      (_, i) => newBlock((elapsed - i), 0)
    );
    return [visibleBlocks, blocksShown];
  }, [createdAtSec, tick, windowSize]);
}
