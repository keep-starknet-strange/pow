import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TransactionPauseState {
  // Map: chainId -> txId -> isDapp -> boolean (paused state)
  pausedTransactions: {
    [chainId: number]: { [txId: number]: { [isDapp: string]: boolean } };
  };
  isInitialized: boolean;

  // Actions
  initializePauseStore: () => Promise<void>;
  setPaused: (
    chainId: number,
    txId: number,
    isDapp: boolean,
    paused: boolean,
  ) => Promise<void>;
  isPaused: (chainId: number, txId: number, isDapp: boolean) => boolean;
  resetPauseStore: () => Promise<void>;
}

const STORAGE_KEY = "transaction_pause_states";

export const useTransactionPauseStore = create<TransactionPauseState>(
  (set, get) => ({
    pausedTransactions: {},
    isInitialized: false,

    initializePauseStore: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          set({ pausedTransactions: parsedData, isInitialized: true });
        } else {
          set({ isInitialized: true });
        }
      } catch (error) {
        console.error("Failed to initialize pause store:", error);
        set({ isInitialized: true });
      }
    },

    setPaused: async (
      chainId: number,
      txId: number,
      isDapp: boolean,
      paused: boolean,
    ) => {
      const { pausedTransactions } = get();
      const dappKey = isDapp ? "true" : "false";

      const newPausedTransactions = { ...pausedTransactions };
      if (!newPausedTransactions[chainId]) {
        newPausedTransactions[chainId] = {};
      }
      if (!newPausedTransactions[chainId][txId]) {
        newPausedTransactions[chainId][txId] = {};
      }

      newPausedTransactions[chainId][txId][dappKey] = paused;

      set({ pausedTransactions: newPausedTransactions });

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(newPausedTransactions),
        );
      } catch (error) {
        console.error("Failed to save pause state:", error);
      }
    },

    isPaused: (chainId: number, txId: number, isDapp: boolean): boolean => {
      const { pausedTransactions } = get();
      const dappKey = isDapp ? "true" : "false";
      return pausedTransactions[chainId]?.[txId]?.[dappKey] ?? false;
    },

    resetPauseStore: async () => {
      // Clear all paused states
      set({ pausedTransactions: {}, isInitialized: true });

      // Clear from AsyncStorage
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear pause states from storage:", error);
      }
    },
  }),
);

export const useTransactionPause = () => {
  return useTransactionPauseStore();
};
