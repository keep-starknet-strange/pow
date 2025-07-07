import { create } from "zustand";

interface BalanceState {
  balance: number;
  setBalance: (balance: number) => void;
  updateBalance: (change: number) => void;
  tryBuy: (cost: number) => boolean;
  notifyDependency?: (eventName: any, data?: any) => void;
  setNotifyDependency: (notify: (eventName: any, data?: any) => void) => void;
  fetchBalanceDependency?: () => Promise<number | undefined>;
  setFetchBalanceDependency: (
    fetchBalance: () => Promise<number | undefined>,
  ) => void;
  fetchBalance: () => Promise<void>;
}

export const useBalanceStore = create<BalanceState>((set, get) => ({
  balance: 0,
  notifyDependency: undefined,
  fetchBalanceDependency: undefined,

  setNotifyDependency: (notify) => set({ notifyDependency: notify }),
  setFetchBalanceDependency: (fetchBalance) =>
    set({ fetchBalanceDependency: fetchBalance }),

  setBalance: (balance: number) => set({ balance }),

  updateBalance: (change: number) => {
    set((state) => {
      const newBalance = state.balance + change;

      if (state.notifyDependency) {
        state.notifyDependency("BalanceUpdated", {
          balance: newBalance,
          change,
        });
      }

      return { balance: newBalance };
    });
  },

  tryBuy: (cost: number) => {
    const { balance, updateBalance, notifyDependency } = get();

    if (balance >= cost) {
      updateBalance(-cost);
      if (notifyDependency) {
        notifyDependency("ItemPurchased", { cost });
      }
      return true;
    } else {
      if (notifyDependency) {
        notifyDependency("BuyFailed", { cost, balance });
      }
      return false;
    }
  },

  fetchBalance: async () => {
    const { fetchBalanceDependency, setBalance } = get();

    if (fetchBalanceDependency) {
      try {
        const balance = await fetchBalanceDependency();
        setBalance(balance ?? 0);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      }
    } else {
      setBalance(0);
    }
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
