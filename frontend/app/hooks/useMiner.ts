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
  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[0];
  const blockDifficulty = miningBlock?.difficulty || 4 ** 2;
  const [mineCounter, setMineCounter] = useState(0);

  useEffect(() => {
    const fetchMineCounter = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const clicks = await getUserBlockClicks(0);
          setMineCounter(clicks || 0);
        } catch (error) {
          if (__DEV__) console.error("Error fetching mine counter:", error);
          setMineCounter(0);
        }
      }
    };
    fetchMineCounter();
  }, [powContract, user, getUserBlockClicks]);

  const mineBlock = useCallback(() => {
    if (!miningBlock?.isBuilt) {
      if (__DEV__) console.warn("Block is not built yet, cannot mine.");
      return;
    }

    // Calculate new counter value first
    const newCounter = mineCounter + 1;

    // Trigger sound immediately before animation and state updates
    if (newCounter < blockDifficulty) {
      notify("MineClicked", {
        counter: newCounter,
        difficulty: blockDifficulty,
        ignoreAction: miningBlock?.blockId === 0,
      });
    }

    // Trigger animation after sound
    if (triggerMineAnimation) {
      triggerMineAnimation();
    }

    // Update state
    setMineCounter((prevCounter) => {
      const updatedCounter = prevCounter + 1;
      if (updatedCounter <= blockDifficulty) {
        return updatedCounter;
      } else {
        return prevCounter; // Prevent incrementing beyond difficulty
      }
    });
  }, [
    triggerMineAnimation,
    miningBlock?.isBuilt,
    blockDifficulty,
    mineCounter,
    notify,
    onBlockMined,
  ]);

  useEffect(() => {
    if (mineCounter === blockDifficulty) {
      onBlockMined();
      setMineCounter(0);
    }
  }, [blockDifficulty, mineCounter, onBlockMined]);

  useAutoClicker(
    getAutomationValue(0, "Miner") > 0 && miningBlock?.isBuilt,
    5000 / (getAutomationValue(0, "Miner") || 1),
    mineBlock,
  );

  return {
    mineCounter,
    mineBlock,
  };
};
