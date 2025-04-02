import React, { createContext, useContext, useState, useEffect } from "react";
import { GameState, newEmptyGameState, UpgradableGameState, newBaseUpgradableGameState } from "../types/GameState";
import { newBlock } from "../types/Block";
import { Transaction } from "../types/Transaction";
import { useEventManager } from "./EventManager";
import { getGameState } from "../api/state";
import { mockAddress } from "../api/mock";


type GameStateContextType = {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  upgradableGameState: UpgradableGameState;
  setUpgradableGameState: React.Dispatch<React.SetStateAction<UpgradableGameState>>;
  updateBalance: (newBalance: number) => void;
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
}

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(newEmptyGameState());
  const [upgradableGameState, setUpgradableGameState] = useState<UpgradableGameState>(newBaseUpgradableGameState());
  const { notify } = useEventManager();

  useEffect(() => {
    const getNewGameState = async () => {
      const newGameState = await getGameState(mockAddress);
      if (!newGameState) return;
      setGameState(newGameState);
    }
    getNewGameState();
  }, []);

  const updateBalance = (newBalance: number) => {
    setGameState((prevState) => ({
      ...prevState,
      balance: newBalance
    }));
    notify("BalanceUpdated", { balance: newBalance });
  }

  return (
    <GameStateContext.Provider value={{ gameState, setGameState, upgradableGameState, setUpgradableGameState, updateBalance }}>
      {children}
    </GameStateContext.Provider>
  );
};
