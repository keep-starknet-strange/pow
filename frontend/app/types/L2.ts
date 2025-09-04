export type L2DA = {
  blocks: number[];
  blockFees: number;
  isBuilt: boolean;
  maxSize: number;
  difficulty: number;
};

export const newL2DA = (maxSize: number = 1, difficulty: number = 1): L2DA => ({
  blocks: [],
  blockFees: 0,
  isBuilt: false,
  maxSize,
  difficulty,
});

export type L2Prover = {
  blocks: number[];
  blockFees: number;
  isBuilt: boolean;
  maxSize: number;
  difficulty: number;
};

export const newL2Prover = (
  maxSize: number = 1,
  difficulty: number = 1,
): L2Prover => ({
  blocks: [],
  blockFees: 0,
  isBuilt: false,
  maxSize,
  difficulty,
});

export type L2 = {
  da: L2DA;
  prover: L2Prover;
};

export const newL2 = (): L2 => ({
  da: newL2DA(),
  prover: newL2Prover(),
});
