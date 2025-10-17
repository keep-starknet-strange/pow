import { create } from "zustand";

interface TransactionOptimizationState {
  bundlingEnabled: boolean;
  toggleBundling: () => void;
}

export const useTransactionOptimizationStore =
  create<TransactionOptimizationState>((set) => ({
    bundlingEnabled: true,
    toggleBundling: () =>
      set((state) => ({ bundlingEnabled: !state.bundlingEnabled })),
  }));
