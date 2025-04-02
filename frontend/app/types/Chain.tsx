import { Block, newBlock } from './Block';

export type Chain = {
  id: number;
  blocks: Block[];
}

export const newEmptyChain = (id: number): Chain => ({
  id,
  blocks: [],
});
