import React, { createContext, useContext, useState, useEffect } from "react";
import { Block } from "../types/Block";
import { newBlock } from "../types/Block";
import { Transaction } from "../types/Transaction";
import { useGameState } from "./GameState";
import { useEventManager } from "./EventManager";

export type CurrentBlockContextType = {
  currentBlock: Block;
  setCurrentBlock: React.Dispatch<React.SetStateAction<Block>>;
};

const CurrentBlockContext = createContext<CurrentBlockContextType | undefined>(undefined);
export const useCurrentBlock = () => {
  const context = useContext(CurrentBlockContext);
  if (!context) {
    throw new Error("useCurrentBlock must be used within a CurrentBlockProvider");
  }
  return context;
};

export const CurrentBlockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { upgradableGameState } = useGameState(); // used for new block creation
  const { notify } = useEventManager();
  const [currentBlock, setCurrentBlock] = useState<Block>(() =>
    newBlock(1, upgradableGameState.blockReward, upgradableGameState.blockSize, upgradableGameState.difficulty)
);

  return (
    <CurrentBlockContext.Provider value={{ currentBlock, setCurrentBlock }}>
      {children}
    </CurrentBlockContext.Provider>
  );
};
