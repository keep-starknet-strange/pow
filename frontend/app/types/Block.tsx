import { Transaction } from "./Transaction";

export type Block = {
  id: number;
  reward: number;
  fees: number;
  transactions: Transaction[];
  maxSize: number;
  hp: number;
};

export const newBlock = (blockNumber: number, blockReward: number, maxSize: number, difficulty: number): Block => {
  return {
    id: blockNumber,
    reward: blockReward,
    fees: 0,
    transactions: [],
    maxSize: maxSize,
    hp: difficulty,
  };
}
