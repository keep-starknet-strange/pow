import { ImageSourcePropType } from "react-native";

export type Transaction = {
  typeId: number;
  fee: number;
  icon: ImageSourcePropType;
  isDapp?: boolean;
};

export const newTransaction = (
  typeId: number,
  fee: number,
  icon: ImageSourcePropType,
  isDapp?: boolean,
): Transaction => {
  return {
    typeId,
    fee,
    icon,
    isDapp,
  };
};

export type Block = {
  blockId: number;
  fees: number;
  transactions: Transaction[];
  isBuilt: boolean;
  reward?: number;
};

export const newBlock = (blockId: number, reward?: number): Block => {
  return {
    blockId,
    fees: 0,
    transactions: [],
    isBuilt: false,
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
