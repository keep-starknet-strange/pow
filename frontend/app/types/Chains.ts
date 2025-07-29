import { ImageSourcePropType } from "react-native";

export type Transaction = {
  typeId: number;
  fee: number;
  isDapp?: boolean;
};

export const newTransaction = (
  typeId: number,
  fee: number,
  isDapp?: boolean,
): Transaction => {
  return {
    typeId,
    fee,
    isDapp,
  };
};

export type Block = {
  blockId: number;
  fees: number;
  transactions: Transaction[];
  isBuilt: boolean;
  maxSize: number; // Static block size set when block is created
  reward?: number;
};

export const newBlock = (
  blockId: number,
  maxSize: number,
  reward?: number,
): Block => {
  return {
    blockId,
    fees: 0,
    transactions: [],
    isBuilt: false,
    maxSize,
    reward,
  };
};

export type Chain = {
  chainId: number;
  blocks: Block[];
};

export const newChain = (chainId: number): Chain => ({
  chainId,
  blocks: [],
});
