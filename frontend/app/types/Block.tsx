import { Transaction } from "./Transaction";

export type Block = {
  id: number;
  reward: number;
  fees: number;
  transactions: Transaction[];
};

export const addTxToBlock = (block: Block, tx: Transaction): Block => {
  return {
    ...block,
    fees: block.fees + tx.fee,
    transactions: [...block.transactions, tx],
  };
}

export const newBlock = (blockNumber: number, blockReward: number): Block => {
  return {
    id: blockNumber,
    reward: blockReward,
    fees: 0,
    transactions: [],
  };
}
