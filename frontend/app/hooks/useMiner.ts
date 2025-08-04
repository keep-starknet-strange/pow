import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";
import { useShallow } from "zustand/react/shallow";

export const useMiner = (
  onBlockMined: () => void,
  triggerMineAnimation?: () => void,
) => {
  const { notify } = useEventManager();
  const { getAutomationValue } = useUpgrades();
  const { user } = useFocEngine();
  const { powContract, getUserBlockClicks } = usePowContractConnector();
  const [mineCounter, setMineCounter] = useState(0);
  const [miningProgress, setMiningProgress] = useState(0);

  useEffect(() => {
    const fetchMineCounter = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const clicks = await getUserBlockClicks(0);
          setMineCounter(clicks || 0);
        } catch (error) {
          console.error("Error fetching mine counter:", error);
          setMineCounter(0);
        }
      }
    };
    fetchMineCounter();
  }, [powContract, user, getUserBlockClicks]);

  // Shallow state management: only re-render when mining block (index 0) changes
  const miningBlock = useGameStore(
    useShallow((state) => state.workingBlocks[0]),
  );
  const mineBlock = useCallback(() => {
    if (!miningBlock?.isBuilt) {
      console.warn("Block is not built yet, cannot mine.");
      return;
    }

    // Trigger animation if provided
    if (triggerMineAnimation) {
      triggerMineAnimation();
    }

    setMineCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const blockDifficulty = miningBlock?.difficulty || 4 ** 2; // Default difficulty if not set
      if (newCounter == blockDifficulty) {
        onBlockMined();
        setMiningProgress(1);
        return newCounter;
      } else if (newCounter < blockDifficulty) {
        setMiningProgress(newCounter / blockDifficulty);
        notify("MineClicked", {
          counter: newCounter,
          difficulty: blockDifficulty,
        });
        return newCounter;
      } else {
        return prevCounter; // Prevent incrementing beyond difficulty
      }
    });
  }, [
    notify,
    onBlockMined,
    miningBlock?.isBuilt,
    miningBlock?.difficulty,
    triggerMineAnimation,
  ]);

  // Reset mining progress when a block is mined
  useEffect(() => {
    setMiningProgress(0);
    setMineCounter(0);
  }, [miningBlock?.blockId]);

  useAutoClicker(
    getAutomationValue(0, "Miner") > 0 && miningBlock?.isBuilt,
    5000 / (getAutomationValue(0, "Miner") || 1),
    mineBlock,
  );

  return {
    mineCounter,
    miningProgress,
    mineBlock,
  };
};
