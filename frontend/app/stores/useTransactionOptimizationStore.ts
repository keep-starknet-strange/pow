import { create } from "zustand";

interface TransactionOptimizationState {
  bundlingEnabled: boolean;
  multiExecEnabled: boolean;
  toggleBundling: () => void;
  toggleMultiExec: () => void;
}

export const useTransactionOptimizationStore =
  create<TransactionOptimizationState>((set) => ({
    bundlingEnabled: false,
    multiExecEnabled: false,
    toggleBundling: () =>
      set((state) => ({ bundlingEnabled: !state.bundlingEnabled })),
    toggleMultiExec: () =>
      set((state) => ({ multiExecEnabled: !state.multiExecEnabled })),
  }));
