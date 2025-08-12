import { create } from "zustand";
import { Contract } from "starknet";
import { useEventManager } from "./useEventManager";
import { FocAccount } from "../context/FocEngineConnector";

// Batch balance updates to prevent excessive rerenders
let balanceUpdateQueue: number[] = [];
let balanceUpdateTimeout: NodeJS.Timeout | null = null;

const DEFAULT_BALANCE = Number(process.env.EXPO_PUBLIC_DEFAULT_BALANCE) || 0;

interface BalanceState {
  balance: number;
  setBalance: (balance: number) => void;
  updateBalance: (change: number) => void;
  tryBuy: (cost: number) => boolean;
  resetBalance: () => void;
  initializeBalance: (
    powContract: Contract | null,
    user: FocAccount | null,
    getUserBalance: () => Promise<number | undefined>,
  ) => Promise<void>;
}

export const useBalanceStore = create<BalanceState>((set, get) => ({
  balance: DEFAULT_BALANCE,
  setBalance: (balance: number) => set({ balance }),

  resetBalance: () => set({ balance: DEFAULT_BALANCE }),

  updateBalance: (change: number) => {
    // Add change to queue for batching
    balanceUpdateQueue.push(change);

    if (balanceUpdateTimeout) {
      clearTimeout(balanceUpdateTimeout);
    }

    // Batch balance updates to reduce rerenders
    balanceUpdateTimeout = setTimeout(() => {
      const totalChange = balanceUpdateQueue.reduce(
        (sum, delta) => sum + delta,
        0,
      );
      balanceUpdateQueue = [];
      balanceUpdateTimeout = null;

      set((state) => {
        const newBalance = state.balance + totalChange;

        useEventManager.getState().notify("BalanceUpdated", {
          balance: newBalance,
          change: totalChange,
        });

        return { balance: newBalance };
      });
    }, 16); // Batch every ~1 frame (16ms)
  },

  tryBuy: (cost: number) => {
    const { balance, updateBalance } = get();

    if (balance >= cost) {
      updateBalance(-cost);
      useEventManager.getState().notify("ItemPurchased", { cost });
      return true;
    } else {
      useEventManager.getState().notify("BuyFailed", { cost, balance });
      return false;
    }
  },

  initializeBalance: async (powContract, user, getUserBalance) => {
    const fetchBalance = async () => {
      if (!user || !powContract) {
        set({ balance: DEFAULT_BALANCE });
        return;
      }
      try {
        const balance = await getUserBalance();
        set({ balance });
      } catch (error) {
        console.error("Error fetching balance:", error);
        set({ balance: DEFAULT_BALANCE });
      }
    };
    fetchBalance();
  },
}));

export const useBalance = () => {
  const { balance, setBalance, updateBalance, tryBuy } = useBalanceStore();

  return {
    balance,
    setBalance,
    updateBalance,
    tryBuy,
  };
};
