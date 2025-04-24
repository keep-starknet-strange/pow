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

export type UpgradableGameState = {
  difficulty: number;
  blockSize: number;
  blockReward: number;
  mevScaling: number;
  sequencerSpeed: number;
  minerSpeed: number;
  proverSpeed: number;
  daSpeed: number;
  sortTransactions: boolean;
  l2Transactions: boolean;
  l2Blobs: boolean;
  dapp: boolean;
  inscriptionMetaprotocol: boolean;
  staking: boolean;
}

const baseDifficulty = 8;
const baseBlockWidth = 8;
const baseReward = 5;
const baseMevScaling = 1;
const baseSequencerSpeed = 0;
const baseMinerSpeed = 0;
const baseProverSpeed = 0;
const baseDASpeed = 0;
export const newBaseUpgradableGameState = (): UpgradableGameState => ({
  difficulty: baseDifficulty,
  blockSize: baseBlockWidth * baseBlockWidth,
  blockReward: baseReward,
  mevScaling: baseMevScaling,
  sequencerSpeed: baseSequencerSpeed,
  minerSpeed: baseMinerSpeed,
  proverSpeed: baseProverSpeed,
  daSpeed: baseDASpeed,
  sortTransactions: false,
  l2Transactions: false,
  l2Blobs: false,
  dapp: false,
  inscriptionMetaprotocol: false,
  staking: false,
});

export type TransactionTypeState = {
  id: number;
  speedLevel: number;
  feeLevel: number;
}
