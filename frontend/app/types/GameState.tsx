import { Chain, newEmptyChain } from "./Chain";
import { L2 } from "./L2";

export type GameState = {
  balance: number;
  chains: Chain[];
  l2?: L2;
}

export const newEmptyGameState = (): GameState => ({
  balance: 0,
  chains: [newEmptyChain(0)],
  l2: undefined,
});

export type ChainUpgradableState = {
  difficulty: number;
  blockWidth: number;
  blockReward: number;
  mevScaling: number;
}

export type UpgradableGameState = {
  l1: ChainUpgradableState;
  l2: ChainUpgradableState;
  sequencerLevel: number;
  minerLevel: number;
  proverLevel: number;
  daLevel: number;
  proverMaxSize: number;
  daMaxSize: number;
  prestige: number;
}

const baseDifficulty = 8;
const baseBlockWidth = 5;
const baseReward = 5;
const baseMevScaling = 1;
const baseSequencerLevel = 0;
const baseMinerLevel = -1;
const baseProverLevel = 0;
const baseDALevel = 0;
const basePrestige = 0;
const baseProverSize = 2;
const baseDASize = 3;
export const newBaseUpgradableGameState = (): UpgradableGameState => ({
  l1: {
    difficulty: baseDifficulty,
    blockWidth: baseBlockWidth,
    blockReward: baseReward,
    mevScaling: baseMevScaling,
  },
  l2: {
    difficulty: baseDifficulty,
    blockWidth: baseBlockWidth,
    blockReward: baseReward,
    mevScaling: baseMevScaling,
  },
  sequencerLevel: baseSequencerLevel,
  minerLevel: baseMinerLevel,
  proverLevel: baseProverLevel,
  daLevel: baseDALevel,
  proverMaxSize: baseProverSize,
  daMaxSize: baseDASize,
  prestige: basePrestige,
});

export type TransactionTypeState = {
  id: number;
  speedLevel: number;
  feeLevel: number;
}
