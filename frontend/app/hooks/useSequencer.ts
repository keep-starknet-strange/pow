import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";

export const useSequencer = (
  onBlockSequenced: () => void,
  triggerSequenceAnimation?: () => void,
) => {
  const { notify } = useEventManager();
  const { getAutomationValue } = useUpgrades();
  const { user } = useFocEngine();
  const { powContract, getUserBlockClicks } = usePowContractConnector();
  const { workingBlocks } = useGameStore();
  const sequencingBlock = workingBlocks[1];
  const blockDifficulty = sequencingBlock?.difficulty || 4 ** 2;
  const [sequenceCounter, setSequenceCounter] = useState(0);

  useEffect(() => {
    const fetchSequenceCounter = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const clicks = await getUserBlockClicks(1);
          setSequenceCounter(clicks || 0);
        } catch (error) {
          if (__DEV__) console.error("Error fetching sequence counter:", error);
          setSequenceCounter(0);
        }
      }
    };
    fetchSequenceCounter();
  }, [powContract, user, getUserBlockClicks]);

  const sequenceBlock = useCallback(() => {
    if (!sequencingBlock?.isBuilt) {
      if (__DEV__) console.warn("Block is not built yet, cannot sequence.");
      return;
    }

    // Trigger animation if provided
    if (triggerSequenceAnimation) {
      triggerSequenceAnimation();
    }
    // Batch state updates to prevent multiple rerenders
    setSequenceCounter((prevCounter) => {
      const newCounter = prevCounter + 1;

      if (newCounter < blockDifficulty) {
        notify("SequenceClicked", {
          counter: newCounter,
          difficulty: blockDifficulty,
          ignoreAction: sequencingBlock?.blockId === 0,
        });
        return newCounter;
      } else if (newCounter === blockDifficulty) {
        return newCounter;
      } else {
        return prevCounter; // Prevent incrementing beyond difficulty
      }
    });
  }, [
    triggerSequenceAnimation,
    sequencingBlock?.isBuilt,
    blockDifficulty,
    sequenceCounter,
    notify,
    onBlockSequenced,
  ]);

  useEffect(() => {
    if (sequenceCounter === blockDifficulty) {
      onBlockSequenced();
      setSequenceCounter(0);
    }
  }, [blockDifficulty, sequenceCounter, onBlockSequenced]);

  useAutoClicker(
    getAutomationValue(1, "Sequencer") > 0 && sequencingBlock?.isBuilt,
    5000 / (getAutomationValue(1, "Sequencer") || 1),
    sequenceBlock,
  );

  return {
    sequenceCounter,
    sequenceBlock,
  };
};
