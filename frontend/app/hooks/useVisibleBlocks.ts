import { useRef, useEffect } from "react";
import { newBlock, Block } from "../types/Chains";
import { randomTransactions } from "../utils/transactionGenerator";

interface TxConfig {
  chainId: number;
  minTxPerBlock: number;
  maxTxPerBlock: number;
  minFee?: number;
  maxFee?: number;
}

const getNowSec = (): number => Math.floor(Date.now() / 1000);

const buildBlock = (blockId: number, txConfig: TxConfig): Block => {
  const blk = newBlock(blockId, 0);
  const transactions = randomTransactions(txConfig);
  const fees = transactions.reduce((sum, tx) => sum + tx.fee, 0);

  return {
    ...blk,
    transactions,
    fees,
    isBuilt: true,
  };
};

export function useVisibleBlocks(
  chainId: number,
  createdAtSec: number,
  tick: number,
  windowSize: number
): [Block[], number] {
  const blocksRef = useRef<Block[]>([]);

  // Transaction configs
  const initialTxConfig: TxConfig = { chainId, minTxPerBlock: 4, maxTxPerBlock: 9 };
  const updateTxConfig: TxConfig = { chainId, minTxPerBlock: 4, maxTxPerBlock: 16, minFee: 1, maxFee: 10 };

  useEffect(() => {
    const elapsed = Math.max(1, getNowSec() - createdAtSec);
    const count = Math.min(elapsed, windowSize);

    blocksRef.current = Array.from({ length: count }, (_, i) =>
      buildBlock(elapsed - i, initialTxConfig)
    );
  }, [chainId, createdAtSec, windowSize]);

  useEffect(() => {
    const elapsed = Math.max(0, getNowSec() - createdAtSec);
    const nextBlockId = elapsed;

    if (blocksRef.current[0]?.blockId >= nextBlockId) return;

    blocksRef.current.unshift(buildBlock(nextBlockId, updateTxConfig));

    if (blocksRef.current.length > windowSize) {
      blocksRef.current.pop();
    }
  }, [tick]);

  return [blocksRef.current, blocksRef.current.length];
}
