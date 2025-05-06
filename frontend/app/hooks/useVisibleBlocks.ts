// src/hooks/useVisibleBlocks.ts
import { useRef, useEffect, useState } from "react";
import { newBlock, Block } from "../types/Chains";
import { randomTransactions } from "../utils/transactionGenerator";

export function useVisibleBlocks(
  chainId: number,
  createdAtSec: number,
  tick: number,
  windowSize: number
): [Block[], number] {
  const blocksRef = useRef<Block[]>([]);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = Math.max(1, now - createdAtSec);
    const count = Math.min(elapsed, windowSize);

    blocksRef.current = Array.from({ length: count }, (_, i) => {
      const blockId = elapsed - i;
      const blk = newBlock(blockId, 0);
      const txs = randomTransactions({ chainId, minTxPerBlock: 4, maxTxPerBlock: 9 });
      blk.transactions = txs;
      blk.fees = txs.reduce((sum, tx) => sum + tx.fee, 0);
      blk.isBuilt = true;
      return blk;
    });

  }, [chainId, createdAtSec, windowSize]);


  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = Math.max(0, now - createdAtSec);
    const blockId = elapsed;
    if (blocksRef.current[0]?.blockId >= blockId) {
      return;
    }

    const block = newBlock(blockId, 0);
    const txs = randomTransactions({
      chainId,
      minTxPerBlock: 4,
      maxTxPerBlock: 16,
      minFee: 1,
      maxFee: 10,
    });
    block.transactions = txs;
    block.fees = txs.reduce((sum, tx) => sum + tx.fee, 0);
    block.isBuilt = true;

    blocksRef.current.unshift(block);
    if (blocksRef.current.length > windowSize) {
      blocksRef.current.pop();
    }

  }, [tick]);

  return [blocksRef.current, blocksRef.current.length];
}
