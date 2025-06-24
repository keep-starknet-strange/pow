import { newEmptyTransaction } from "../utils/transactions";
import { GameState } from "../types/GameState";

export const mockAddress =
  process.env.EXPO_PUBLIC_MOCK_ADDRESS ||
  "0x04db37570e07ef111103674778c3716ec5b877e0dec0e9ab90bb3d6b299d4589";

export const mockGameState: GameState = {
  balance: 14200,
  chains: [
    {
      id: 0,
      currentBlock: {
        id: 4,
        reward: 5,
        fees: 7,
        hp: 8,
        transactions: Array.from({ length: 12 }, (_) => newEmptyTransaction()),
        maxSize: 64,
      },
      pastBlocks: Array.from({ length: 3 }, (_, i) => ({
        id: 3 - i,
        reward: 5,
        fees: 0,
        hp: 0,
        transactions: Array.from({ length: 64 }, (_) => newEmptyTransaction()),
        maxSize: 64,
      })),
    },
    {
      id: 1,
      currentBlock: {
        id: 2,
        reward: 10,
        fees: 2,
        hp: 1,
        transactions: Array.from({ length: 12 }, (_) => newEmptyTransaction()),
        maxSize: 64,
      },
      pastBlocks: Array.from({ length: 1 }, (_, i) => ({
        id: 1 - i,
        reward: 10,
        fees: 0,
        hp: 0,
        transactions: Array.from({ length: 64 }, (_) => newEmptyTransaction()),
        maxSize: 64,
      })),
    },
  ],
};
