import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";
import { useBatchedUpdates, useDebounce } from "./useBatchedUpdates";

export const useMiner = (
  onBlockMined: () => void,
  triggerMineAnimation?: () => void,
) => {
  const { notify } = useEventManager();
  const { getAutomationValue } = useUpgrades();
  const { user } = useFocEngine();
  const { powContract, getUserBlockClicks } = usePowContractConnector();
  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[0];
  const blockDifficulty = miningBlock?.difficulty || 4 ** 2;
  const [mineCounter, setMineCounter] = useState(0);
  const [miningProgress, setMiningProgress] = useState(0);
  const { batchUpdate } = useBatchedUpdates();
  const debouncedNotify = useDebounce(50); // Debounce notifications by 50ms

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

  const mineBlock = useCallback(() => {
    if (!miningBlock?.isBuilt) {
      console.warn("Block is not built yet, cannot mine.");
      return;
    }

    // Trigger animation if provided
    if (triggerMineAnimation) {
      triggerMineAnimation();
    }
    // Batch state updates to prevent multiple rerenders
    setMineCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const blockDifficulty = miningBlock?.difficulty || 4 ** 2; // Default difficulty if not set

      if (newCounter <= blockDifficulty) {
        const newProgress = newCounter / blockDifficulty;
        // Batch progress update
        batchUpdate(() => {
          setMiningProgress(newProgress);
        });
        return newCounter;
      } else {
        return prevCounter; // Prevent incrementing beyond difficulty
      }
    });
  }, [
    triggerMineAnimation,
    miningBlock?.isBuilt,
    miningBlock?.difficulty,
    batchUpdate,
  ]);

  useEffect(() => {
    if (mineCounter === blockDifficulty) {
      batchUpdate(() => {
        setMiningProgress(1);
        onBlockMined();
        setMineCounter(0);
      });
    } else if (mineCounter > 0) {
      // Debounce event notifications to reduce overhead
      debouncedNotify(() => {
        notify("MineClicked", {
          counter: mineCounter,
          difficulty: blockDifficulty,
        });
      });
    }
  }, [
    mineCounter,
    blockDifficulty,
    notify,
    onBlockMined,
    batchUpdate,
    debouncedNotify,
  ]);

  // Reset mining progress when a block is mined

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
