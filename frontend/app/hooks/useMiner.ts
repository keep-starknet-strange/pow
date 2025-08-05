import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";

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

  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[0];
  const mineBlock = useCallback(() => {
    if (!miningBlock?.isBuilt) {
      console.warn("Block is not built yet, cannot mine.");
      return;
    }

    // Trigger animation if provided
    if (triggerMineAnimation) {
      triggerMineAnimation();
    }

    const blockDifficulty = miningBlock?.difficulty || 4 ** 2; // Default difficulty if not set
    
    setMineCounter(prevCounter => {
      const newCounter = prevCounter + 1;
      return newCounter <= blockDifficulty ? newCounter : prevCounter;
    });
  }, [
    notify,
    onBlockMined,
    miningBlock?.isBuilt,
    miningBlock?.difficulty,
    triggerMineAnimation,
  ]);

  // Handle mining progress updates
  useEffect(() => {
    const blockDifficulty = miningBlock?.difficulty || 4 ** 2;
    
    if (mineCounter === blockDifficulty) {
      setMiningProgress(1);
      onBlockMined();
    } else if (mineCounter < blockDifficulty) {
      setMiningProgress(mineCounter / blockDifficulty);
      if (mineCounter > 0) { // Don't notify on initial mount or reset
        notify("MineClicked", {
          counter: mineCounter,
          difficulty: blockDifficulty,
        });
      }
    }
  }, [mineCounter, miningBlock?.difficulty, notify, onBlockMined]);

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
