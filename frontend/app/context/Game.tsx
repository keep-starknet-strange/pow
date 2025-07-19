import React, {
  createContext,
  useContext,
} from "react";
import { useMiner } from "../hooks/useMiner";
import { useSequencer } from "../hooks/useSequencer";
import { useDAConfirmer } from "../hooks/useDAConfirmer";
import { useProver } from "../hooks/useProver";
import { useGameStore } from "../stores/useGameStore";

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
  const { onBlockMined, onBlockSequenced, onDaConfirmed, onProverConfirmed,
    getWorkingBlock, getDa, getProver } =
    useGameStore();
  const { miningProgress, mineBlock } = useMiner(onBlockMined, getWorkingBlock);
  const { sequencingProgress, sequenceBlock } = useSequencer(
    onBlockSequenced,
    getWorkingBlock,
  );
  const { daProgress, daConfirm } = useDAConfirmer(onDaConfirmed, getDa);
  const { proverProgress, prove } = useProver(onProverConfirmed, getProver);

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
