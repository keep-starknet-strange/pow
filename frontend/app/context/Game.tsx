import React, { createContext, useContext } from "react";
import { useMiner } from "../hooks/useMiner";
import { useSequencer } from "../hooks/useSequencer";
import { useDAConfirmer } from "../hooks/useDAConfirmer";
import { useProver } from "../hooks/useProver";
import { useGameStore } from "../stores/useGameStore";
import { useL2Store } from "../stores/useL2Store";

export const genesisBlockReward = 1;
type GameContextType = {
  miningProgress: number;
  mineBlock: () => void;
  sequencingProgress: number;
  sequenceBlock: () => void;
  daProgress: number;
  daConfirm: () => void;
  proverProgress: number;
  prove: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { onBlockMined, onBlockSequenced } = useGameStore();
  const { onDaConfirmed, getDa, onProverConfirmed, getProver } = useL2Store();
  const { miningProgress, mineBlock } = useMiner(onBlockMined);
  const { sequencingProgress, sequenceBlock } = useSequencer(onBlockSequenced);
  const { daProgress, daConfirm } = useDAConfirmer(onDaConfirmed);
  const { proverProgress, prove } = useProver(onProverConfirmed);

  return (
    <GameContext.Provider
      value={{
        miningProgress,
        mineBlock,
        sequencingProgress,
        sequenceBlock,
        daProgress,
        daConfirm,
        proverProgress,
        prove,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
