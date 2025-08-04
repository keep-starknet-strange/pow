import { useState, useEffect, useCallback } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";
import { Block } from "../types/Chains";
import { useShallow } from "zustand/react/shallow";

export const useSequencer = (onBlockSequenced: () => void) => {
  const { notify } = useEventManager();
  const { user } = useFocEngine();
  const { powContract, getUserBlockClicks } = usePowContractConnector();
  const { getAutomationValue } = useUpgrades();
  const [sequenceCounter, setSequenceCounter] = useState(0);
  const [sequencingProgress, setSequencingProgress] = useState(0);

  useEffect(() => {
    const fetchSequencerCounter = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const clicks = await getUserBlockClicks(1);
          setSequenceCounter(clicks || 0);
        } catch (error) {
          console.error("Error fetching mine counter:", error);
          setSequenceCounter(0);
        }
      }
    };
    fetchSequencerCounter();
  }, [powContract, user, getUserBlockClicks]);

  // Shallow state management: only re-render when sequencing block (index 1) changes
  const sequencingBlock = useGameStore(
    useShallow((state) => state.workingBlocks[1]),
  );
  // Also need mining block (index 0) for autoClicker condition
  const miningBlock = useGameStore(
    useShallow((state) => state.workingBlocks[0]),
  );
  const sequenceBlock = useCallback(() => {
    if (!sequencingBlock?.isBuilt) {
      console.warn("Block is not built yet, cannot sequence.");
      return;
    }
    setSequenceCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const blockDifficulty = sequencingBlock?.difficulty || 4 ** 2;
      if (newCounter == blockDifficulty) {
        onBlockSequenced();
        setSequencingProgress(1);
        return newCounter;
      } else if (newCounter < blockDifficulty) {
        setSequencingProgress(newCounter / blockDifficulty);
        notify("SequenceClicked", {
          counter: newCounter,
        });
        return newCounter;
      } else {
        return prevCounter; // Prevent incrementing beyond block difficulty
      }
    });
  }, [
    onBlockSequenced,
    notify,
    sequencingBlock?.isBuilt,
    sequencingBlock?.difficulty,
  ]);

  // Reset sequencing progress when block is sequenced
  useEffect(() => {
    setSequencingProgress(0);
    setSequenceCounter(0);
  }, [sequencingBlock?.blockId]);

  useAutoClicker(
    getAutomationValue(1, "Sequencer") > 0 && miningBlock?.isBuilt,
    5000 / (getAutomationValue(1, "Sequencer") || 1),
    sequenceBlock,
  );

  return {
    sequenceCounter,
    sequencingProgress,
    sequenceBlock,
  };
};
