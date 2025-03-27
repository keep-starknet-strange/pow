import { Chain, newEmptyChain } from "./Chain";

export type GameState = {
  balance: number;
  chains: Chain[];
}

export const newEmptyGameState = (): GameState => ({
  balance: 0,
  chains: [newEmptyChain(0)]
});

export type UpgradableGameState = {
  difficulty: number;
  blockSize: number;
  blockReward: number;
  mevScaling: number;
  sequencerSpeed: number;
  minerSpeed: number;
  sortTransactions: boolean;
  l2Transactions: boolean;
  l2Blobs: boolean;
  dapp: boolean;
  inscriptionMetaprotocol: boolean;
}

const baseDifficulty = 8;
const baseBlockWidth = 8;
const baseReward = 5;
const baseMevScaling = 1;
const baseSequencerSpeed = 0;
const baseMinerSpeed = 0;
export const newBaseUpgradableGameState = (): UpgradableGameState => ({
  difficulty: baseDifficulty,
  blockSize: baseBlockWidth * baseBlockWidth,
  blockReward: baseReward,
  mevScaling: baseMevScaling,
  sequencerSpeed: baseSequencerSpeed,
  minerSpeed: baseMinerSpeed,
  sortTransactions: false,
  l2Transactions: false,
  l2Blobs: false,
  dapp: false,
  inscriptionMetaprotocol: false,
});
