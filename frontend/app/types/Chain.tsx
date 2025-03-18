import { Block } from './Block';

export type Chain = {
  id: number;
  currentBlock: Block;
  lastBlock: Block | null;
}
