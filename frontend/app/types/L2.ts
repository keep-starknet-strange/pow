export type L2DA = {
  blocks: number[];
  blockFees: number;
  isBuilt: boolean;
}

export const newL2DA = (): L2DA => ({
  blocks: [],
  blockFees: 0,
  isBuilt: false,
});

export type L2Prover = {
  blocks: number[];
  blockFees: number;
  isBuilt: boolean;
}

export const newL2Prover = (): L2Prover => ({
  blocks: [],
  blockFees: 0,
  isBuilt: false,
});

export type L2 = {
  da: L2DA;
  prover: L2Prover;
}

export const newL2 = (): L2 => ({
  da: newL2DA(),
  prover: newL2Prover(),
});
