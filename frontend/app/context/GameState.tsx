import React, { createContext, useContext, useState, useEffect } from "react";
import { GameState, newEmptyGameState, UpgradableGameState, newBaseUpgradableGameState } from "../types/GameState";
import { newBlock } from "../types/Block";
import { Transaction } from "../types/Transaction";
import { useEventManager } from "./EventManager";
import { getGameState } from "../api/state";
import { mockAddress } from "../api/mock";

type GameStateContextType = {
  gameState: GameState;
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
    setGameState((prevGameState) => {
      const finalizedBlock = { ...prevGameState.chains[0].currentBlock };
      console.log("Finalizing block", finalizedBlock.id);
      const pastBlocks = prevGameState.chains[0].pastBlocks
      // keep only the last 4 blocks in the past blocks to prevent state from getting too large
        ? [finalizedBlock, ...prevGameState.chains[0].pastBlocks.slice(0, 4)]
        : [finalizedBlock];
  
      const newCurrentBlock = newBlock(
        finalizedBlock.id + 1,
        upgradableGameState.blockReward,
        upgradableGameState.blockSize,
        upgradableGameState.difficulty
      );
  
      const newBalance = prevGameState.balance + finalizedBlock.reward + finalizedBlock.fees;
  
      notify("BlockFinalized", { blockId: finalizedBlock.id });
      notify("BlockCreated", { block: newCurrentBlock });
      notify("BalanceUpdated", { balance: newBalance });
  
      return {
        ...prevGameState,
        balance: newBalance,
        chains: [{
          ...prevGameState.chains[0],
          lastBlock: finalizedBlock,
          pastBlocks,
          currentBlock: newCurrentBlock
        }]
      };
      
    });

  };
  
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
    console.log("Adding TX", tx.meta1, "to block", gameState.chains[0].currentBlock.id);

  }
  return (
    <GameStateContext.Provider value={{ gameState, upgradableGameState, setUpgradableGameState, finalizeBlock, updateBalance, addTxToBlock }}>
      {children}
    </GameStateContext.Provider>
  );
};
