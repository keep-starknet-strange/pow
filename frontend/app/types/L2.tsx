export type L2DA = {
  blocks: number[];
  blockFees: number;
  maxSize: number;
  hp: number;
}

export const newEmptyL2DA = (): L2DA => ({
  blocks: [],
  blockFees: 0,
  maxSize: 3,
  hp: 4,
});

export type L2Prover = {
  type: string;
  blocks: number[];
  blockFees: number;
  maxSize: number;
  hp: number;
}

export const newEmptyL2Prover = (): L2Prover => ({
  type: 'Stone',
  blocks: [],
  blockFees: 0,
  maxSize: 2,
  hp: 8,
});

export type L2 = {
  da: L2DA;
  prover: L2Prover;
}

export const newEmptyL2 = (): L2 => ({
  da: newEmptyL2DA(),
  prover: newEmptyL2Prover(),
});
