import { newTransaction, Transaction } from "../types/Chains";
import { getTxIcon } from "./transactions";
import transactionsJson from "../configs/transactions.json";

type GeneratorOptions = {
  chainId: number;
  minTxPerBlock?: number;
  maxTxPerBlock?: number;
  minFee?: number;
  maxFee?: number;
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomTransaction(chainId: number, minFee = 1, maxFee = 10): Transaction {
  const txMetaList = chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
  const typeIds = Object.keys(txMetaList).map(k => Number(k));
  const typeId = typeIds[randInt(0, typeIds.length - 1)];
  const fee = randInt(minFee, maxFee);
  const icon = getTxIcon(chainId, typeId);
  return newTransaction(typeId, fee, icon);
}

export function randomTransactionsForBlock(
  chainId: number,
  count: number,
  feeRange: [number, number] = [1, 10]
): Transaction[] {
  return Array.from({ length: count }, () =>
    randomTransaction(chainId, feeRange[0], feeRange[1])
  );
}

export function randomTransactions(
  opts: GeneratorOptions
): Transaction[] {
  const {
    chainId,
    minTxPerBlock = 1,
    maxTxPerBlock = 9,
    minFee = 1,
    maxFee = 10,
  } = opts;
  const count = randInt(minTxPerBlock, maxTxPerBlock);
  return randomTransactionsForBlock(chainId, count, [minFee, maxFee]);
}
