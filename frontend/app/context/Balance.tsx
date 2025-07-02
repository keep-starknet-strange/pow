import React, { createContext, useState, useContext, useEffect } from "react";
import { useEventManager } from "./EventManager";
import { useFocEngine } from "./FocEngineConnector";
import { usePowContractConnector } from "./PowContractConnector";

type BalanceContextType = {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  tryBuy: (cost: number) => boolean;
  updateBalance: (change: number) => void;
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};

export const BalanceContext = createContext<BalanceContextType | undefined>(
  undefined,
);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { notify } = useEventManager();
  const { user, getLatestEventWith } = useFocEngine();
  const { powContract, getUserBalance } = usePowContractConnector();
  // TODO: balance to bigint?
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (powContract && user) {
        try {
          /*
           * TODO: Use Foc Engine?
          const balance = await getLatestEventWith(powGameContractAddress, "pow_game::pow::PowGame::BalanceUpdated", {
            user: user.account_address,
          });
          */
          const balance = await getUserBalance();
          setBalance(balance || 0);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      } else {
        setBalance(0);
      }
    };

    fetchBalance();
  }, [powContract, user, getLatestEventWith]);

  const updateBalance = (change: number) => {
    setBalance((prevBalance) => {
      const newBalance = prevBalance + change;
      notify("BalanceUpdated", { balance: newBalance, change });
      return newBalance;
    });
  };

  const tryBuy = (cost: number) => {
    if (balance >= cost) {
      updateBalance(-cost);
      notify("ItemPurchased", { cost });
      return true;
    } else {
      notify("BuyFailed", { cost, balance });
      return false;
    }
  };

  return (
    <BalanceContext.Provider
      value={{ balance, setBalance, tryBuy, updateBalance }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
