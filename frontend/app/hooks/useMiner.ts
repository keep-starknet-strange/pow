import { useCallback, useReducer } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";

interface MiningState {
  counter: number;
  progress: number;
}

type MiningAction =
  | { type: 'MINE'; payload: { difficulty: number; onBlockMined: () => void; notify: (event: string, data: any) => void } }
  | { type: 'RESET' };

function miningReducer(state: MiningState, action: MiningAction): MiningState {
  switch (action.type) {
    case 'MINE': {
      const newCounter = state.counter + 1;
      const { difficulty, onBlockMined, notify } = action.payload;
      
      if (newCounter === difficulty) {
        onBlockMined();
        return {
          counter: difficulty,
          progress: 1
        };
      } else {
        notify("MineClicked", { counter: newCounter, blockDifficulty: difficulty });
        return {
          counter: newCounter,
          progress: newCounter / difficulty
        };
      }
    }
    case 'RESET':
      return {
        counter: 0,
        progress: 0
      };
    default:
      return state;
  }
}

export const useMiner = (onBlockMined: () => void) => {
  const { notify } = useEventManager();
  const { getAutomationValue } = useUpgrades();
  const { workingBlocks } = useGameStore();

  const [miningState, dispatch] = useReducer(miningReducer, {
    counter: 0,
    progress: 0
  });

  const mineBlock = useCallback(() => {
    const miningBlock = workingBlocks[0];
    if (!miningBlock?.isBuilt) {
      console.log("Block is not built");
      return;
    }

    const blockDifficulty = miningBlock.difficulty || 4 ** 2;
    
    dispatch({ 
      type: 'MINE', 
      payload: { 
        difficulty: blockDifficulty,
        onBlockMined,
        notify: (event: string, data: any) => notify(event as any, data)
      } 
    });
  }, [workingBlocks[0]?.isBuilt, workingBlocks[0]?.difficulty, onBlockMined, notify]);

  // Reset counter when block changes
  if (workingBlocks[0]?.blockId !== undefined) {
    dispatch({ type: 'RESET' });
  }

  useAutoClicker(
    getAutomationValue(0, "Miner") > 0 && miningBlock?.isBuilt,
    5000 / (getAutomationValue(0, "Miner") || 1),
    mineBlock,
  );

  return {
    mineCounter: miningState.counter,
    miningProgress: miningState.progress,
    mineBlock,
  };
};
