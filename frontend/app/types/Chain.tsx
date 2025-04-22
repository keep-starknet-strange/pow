import { Block, newBlock } from './Block';
import { StakingPool, newStakingPool } from './StakingPool';

export type Chain = {
  id: number;
  currentBlock: Block;
  lastBlock: Block | null;
  pastBlocks?: Block[];
  stakingPool: StakingPool;
}

export const newEmptyChain = (id: number): Chain => ({
  id,
  currentBlock: newBlock(0, 0, 0, 0),
  lastBlock: null,
  pastBlocks: [],
  stakingPool: newStakingPool(0, 0, 0),
});
