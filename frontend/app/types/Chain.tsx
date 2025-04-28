import { Block, newBlock } from './Block';
import { StakingPool, newStakingPool } from './StakingPool';

export type Chain = {
  id: number;
  currentBlock: Block;
  pastBlocks: Block[];
  stakingPool: StakingPool;
}

const genesisBlockReward = 1;
const genesisBlockDifficulty = 4;
export const newEmptyChain = (id: number): Chain => ({
  id,
  currentBlock: newBlock(0, genesisBlockReward, 0, genesisBlockDifficulty),
  pastBlocks: [],
  stakingPool: newStakingPool(0, 0, 0),
});
