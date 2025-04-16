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
  finalizeBlock: () => void;
  updateBalance: (newBalance: number) => void;
  addTxToBlock: (tx: Transaction) => void;
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

  const finalizeBlock = () => {
    const newGameState = { ...gameState };

    const finalizedBlock = { ...gameState.chains[0].currentBlock };
    newGameState.chains[0].lastBlock = finalizedBlock;
    newGameState.chains[0].pastBlocks = gameState.chains[0].pastBlocks ? [finalizedBlock, ...gameState.chains[0].pastBlocks] : [finalizedBlock];
    notify("BlockFinalized", { block: finalizedBlock });

    const newCurrentBlock = newBlock(finalizedBlock.id + 1, upgradableGameState.blockReward, upgradableGameState.blockSize, upgradableGameState.difficulty);
    newGameState.chains[0].currentBlock = newCurrentBlock;
    notify("BlockCreated", { block: newCurrentBlock });

    const newBalance = gameState.balance + finalizedBlock.reward + finalizedBlock.fees;
    newGameState.balance = newBalance;
    notify("BalanceUpdated", { balance: newBalance });

    setGameState(newGameState);
  }

  const updateBalance = (newBalance: number) => {
    setGameState((prevState) => ({
      ...prevState,
      balance: newBalance
    }));
    notify("BalanceUpdated", { balance: newBalance });
  }

  const addTxToBlock = (tx: Transaction) => {
    if (tx === undefined) return;
    const newCurrentBlock = {
      ...gameState.chains[0].currentBlock,
      fees: gameState.chains[0].currentBlock.fees + tx.fee,
      transactions: [...gameState.chains[0].currentBlock.transactions, tx]
    };
    setGameState((prevState) => ({
      ...prevState,
      chains: [{
        ...prevState.chains[0],
        currentBlock: newCurrentBlock
      }]
    }));
    notify("TxAdded", { tx });
  }

  return (
    <GameStateContext.Provider value={{ gameState, setGameState, upgradableGameState, setUpgradableGameState, finalizeBlock, updateBalance, addTxToBlock }}>
      {children}
    </GameStateContext.Provider>
  );
};
