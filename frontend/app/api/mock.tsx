import { newEmptyTransaction } from "../utils/transactions";
import { newStakingPool } from "../types/StakingPool";
import { GameState } from "../types/GameState";

export const mockAddress = process.env.EXPO_PUBLIC_MOCK_ADDRESS || "0x04db37570e07ef111103674778c3716ec5b877e0dec0e9ab90bb3d6b299d4589";

export const mockGameState: GameState = {
  balance: 14200,
  chains: [
    {
      id: 0,
      apy: 0.05,
      stakingPool: newStakingPool(0, 0, 0),
      currentBlock: {
        id: 4,
        reward: 5,
        fees: 7,
        hp: 8,
        transactions: Array.from({ length: 12 }, (_) => (newEmptyTransaction())),
        maxSize: 64,
      },
      lastBlock: {
        id: 3,
        reward: 5,
        fees: 0,
        hp: 0,
        transactions: Array.from({ length: 64 }, (_) => (newEmptyTransaction())),
        maxSize: 64,
      },
      pastBlocks: Array.from({ length: 3 }, (_, i) => ({
        id: 3 - i,
        reward: 5,
        fees: 0,
        hp: 0,
        transactions: Array.from({ length: 64 }, (_) => (newEmptyTransaction())),
        maxSize: 64,
      })),
    }
  ]
};
