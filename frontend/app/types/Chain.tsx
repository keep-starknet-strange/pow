import { Block, newBlock } from './Block';
import { StakingPool, newStakingPool } from './StakingPool';

export type Chain = {
  id: number;
  currentBlock: Block;
  lastBlock: Block | null;
  pastBlocks?: Block[];
}

export const newEmptyChain = (id: number): Chain => ({
  id,
  currentBlock: newBlock(0, 0, 0, 0),
  lastBlock: null,
  pastBlocks: []
});
