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
          console.error("Error fetching mine counter:", error);
          setMineCounter(0);
        }
      }
    };
    fetchMineCounter();
  }, [powContract, user, getUserBlockClicks]);

  const mineBlock = useCallback(() => {
    console.log("miningBlock", mineCounter);
    if (!miningBlock?.isBuilt) {
      console.warn("Block is not built yet, cannot mine.");
      return;
    }

    // Trigger animation if provided
    if (triggerMineAnimation) {
      triggerMineAnimation();
    }
    setMineCounter((prevCount) => {
      const newCounter = prevCount + 1;
      if (newCounter <= blockDifficulty) {
        return newCounter;
      }
      return prevCount; // Prevent incrementing beyond difficulty
    });
  }, [triggerMineAnimation, miningBlock?.isBuilt, blockDifficulty]);

  useEffect(() => {
    if (mineCounter == blockDifficulty) {
      onBlockMined();
      setMineCounter(0);
    } else if (mineCounter > 0) {
      notify("MineClicked", {
        counter: mineCounter,
        difficulty: blockDifficulty,
      });
    }
  }, [mineCounter, blockDifficulty, notify]);

  // Reset mining progress when a block is mined


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
