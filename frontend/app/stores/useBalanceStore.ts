import { create } from "zustand";
import { Contract } from "starknet";
import { useEventManager } from "./useEventManager";
import { FocAccount } from "../context/FocEngineConnector";

interface BalanceState {
  balance: number;
  setBalance: (balance: number) => void;
  updateBalance: (change: number) => void;
  tryBuy: (cost: number) => boolean;
  initializeBalance: (
    powContract: Contract | null,
    user: FocAccount | null,
    getUserBalance: () => Promise<number | undefined>,
  ) => Promise<void>;
}

export const useBalanceStore = create<BalanceState>((set, get) => ({
  balance: 0,
  setBalance: (balance: number) => set({ balance }),

  updateBalance: (change: number) => {
    set((state) => {
      const newBalance = state.balance + change;

      useEventManager.getState().notify("BalanceUpdated", {
        balance: newBalance,
        change,
      });

      return { balance: newBalance };
    });
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
        set({ balance: 0 });
        return;
      }
      try {
        const balance = await getUserBalance();
        set({ balance });
      } catch (error) {
        console.error("Error fetching balance:", error);
        set({ balance: 0 });
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
