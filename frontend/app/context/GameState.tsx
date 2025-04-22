import React, { createContext, useContext, useState, useEffect } from "react";
import { Mutex } from "async-mutex";
import { GameState, newEmptyGameState, UpgradableGameState, newBaseUpgradableGameState } from "../types/GameState";
import { newBlock } from "../types/Block";
import { Transaction } from "../types/Transaction";
import { newEmptyL2 } from "../types/L2";
import { useEventManager } from "./EventManager";
import { getGameState } from "../api/state";
import { mockAddress } from "../api/mock";

type GameStateContextType = {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  upgradableGameState: UpgradableGameState;
  setUpgradableGameState: React.Dispatch<React.SetStateAction<UpgradableGameState>>;
  updateBalance: (newBalance: number) => void;

  finalizeBlock: () => void;
  addTxToBlock: (tx: Transaction) => void;

  unlockL2: () => void;
  finalizeL2Block: () => void;
  addL2TxToBlock: (tx: Transaction) => void;

  finalizeL2Proof: () => void;
  finalizeL2DA: () => void;
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

    // TODO: Use prevState
    setGameState(newGameState);
  }

  const finalizeL2Block = () => {
    if (!gameState.l2) return;
    const newGameState = { ...gameState };
    if (!newGameState.l2) return;

    const finalizedBlock = { ...gameState.chains[1].currentBlock };
    newGameState.chains[1].lastBlock = finalizedBlock;
    newGameState.chains[1].pastBlocks = gameState.chains[1].pastBlocks ? [finalizedBlock, ...gameState.chains[1].pastBlocks] : [finalizedBlock];
    notify("L2BlockFinalized", { block: finalizedBlock });

    const newCurrentBlock = newBlock(finalizedBlock.id + 1, upgradableGameState.blockReward, upgradableGameState.blockSize, upgradableGameState.difficulty);
    newGameState.chains[1].currentBlock = newCurrentBlock;
    notify("L2BlockCreated", { block: newCurrentBlock });

    const newL2DA = { ...gameState.l2.da };
    newL2DA.blocks = newL2DA.blocks ? [finalizedBlock.id, ...gameState.l2.da.blocks] : [finalizedBlock.id];
    newL2DA.blockFees = newL2DA.blockFees + (finalizedBlock.fees * 0.6); // 60% of fees go to L2 DA
    newGameState.l2.da = newL2DA;
    notify("L2DAUpdated", { da: newL2DA });

    const newL2Prover = { ...gameState.l2.prover };
    newL2Prover.blocks = newL2Prover.blocks ? [...gameState.l2.prover.blocks, finalizedBlock.id] : [finalizedBlock.id];
    newL2Prover.blockFees = newL2Prover.blockFees + (finalizedBlock.fees * 0.4) + finalizedBlock.reward; // 40% of fees go to L2 Prover + block reward
    newGameState.l2.prover = newL2Prover;

    // TODO: Use prevState
    setGameState(newGameState);
  }

  const updateBalance = (newBalance: number) => {
    setGameState((prevState) => ({
      ...prevState,
      balance: newBalance
    }));
    notify("BalanceUpdated", { balance: newBalance });
  }

  const addTxToBlock = async (tx: Transaction) => {
    if (tx === undefined) return;
    setGameState((prevState) => 
    ({
      ...prevState,
      chains: [
        {
          ...prevState.chains[0],
          currentBlock: {
            ...prevState.chains[0].currentBlock,
            fees: prevState.chains[0].currentBlock.fees + tx.fee,
            transactions: prevState.chains[0].currentBlock.transactions.concat(tx)
          }
        },
        prevState.chains[1]
      ]
    }));
    notify("TxAdded", { tx });
  };

  const addL2TxToBlock = (tx: Transaction) => {
    if (tx === undefined) return;
    setGameState((prevState) => ({
      ...prevState,
      chains: [
        prevState.chains[0],
        {
          ...prevState.chains[1],
          currentBlock: {
            ...prevState.chains[1].currentBlock,
            fees: prevState.chains[1].currentBlock.fees + tx.fee,
            transactions: prevState.chains[1].currentBlock.transactions.concat(tx)
          }
        }
      ]
    }));
    notify("L2TxAdded", { tx });
  }

  const unlockL2 = () => {
    if (gameState.l2) return;
    setGameState((prevState) => ({
      ...prevState,
      l2: newEmptyL2()
    }));
    notify("L2Unlocked", {});
  }

  const finalizeL2Proof = () => {
    if (!gameState.l2) return;

    const finalizedProof = { ...gameState.l2.prover };
    notify("L2ProofFinalized", { proof: finalizedProof });

    setGameState((prevState) => ({
      ...prevState,
      l2: {
        ...prevState.l2,
        prover: { ...prevState.l2.prover, blockFees: 0, blocks: [] }
      }
    }));
  }

  const finalizeL2DA = () => {
    if (!gameState.l2) return;
    const newGameState = { ...gameState };
    if (!newGameState.l2) return;

    const finalizedDA = { ...gameState.l2.da };
    notify("L2DAFinalized", { da: finalizedDA });

    setGameState((prevState) => ({
      ...prevState,
      l2: {
        ...prevState.l2,
        da: { ...prevState.l2.da, blockFees: 0, blocks: [] }
      }
    }));
  }

  return (
    <GameStateContext.Provider value={{ gameState, setGameState, upgradableGameState, setUpgradableGameState, finalizeBlock, updateBalance, addTxToBlock, finalizeL2Block, addL2TxToBlock, unlockL2,
    finalizeL2Proof, finalizeL2DA }}>
      {children}
    </GameStateContext.Provider>
  );
};
