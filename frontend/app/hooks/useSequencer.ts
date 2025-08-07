import { useState, useEffect, useCallback } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useGameStore } from "../stores/useGameStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";
import { Block } from "../types/Chains";

export const useSequencer = (
  onBlockSequenced: () => void,
  triggerSequenceAnimation?: () => void,
) => {
  const { notify } = useEventManager();
  const { user } = useFocEngine();
  const { powContract, getUserBlockClicks } = usePowContractConnector();
  const { getAutomationValue } = useUpgrades();
  const [sequenceCounter, setSequenceCounter] = useState(0);

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

  const { workingBlocks } = useGameStore();
  const sequencingBlock = workingBlocks[1];
  const miningBlock = workingBlocks[0];
  const sequenceBlock = useCallback(() => {
    if (!sequencingBlock?.isBuilt) {
      console.warn("Block is not built yet, cannot sequence.");
      return;
    }

    // Trigger animation if provided
    if (triggerSequenceAnimation) {
      triggerSequenceAnimation();
    }

    setSequenceCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const blockDifficulty = sequencingBlock?.difficulty || 4 ** 2;
      if (newCounter <= blockDifficulty) {
        return newCounter;
      } else {
        return prevCounter; // Prevent incrementing beyond block difficulty
      }
    });
  }, [
    notify,
    sequencingBlock?.isBuilt,
    sequencingBlock?.difficulty,
    triggerSequenceAnimation,
  ]);

  useEffect(() => {
    if (sequenceCounter == sequencingBlock?.difficulty) {
      onBlockSequenced();
    } else if (sequenceCounter > 0) {
      notify("SequenceClicked", {
        counter: sequenceCounter,
      });
    }
  }, [sequenceCounter]);

  // Reset sequencing progress when block is sequenced
  useEffect(() => {
    setSequenceCounter(0);
  }, [sequencingBlock?.blockId]);

  useAutoClicker(
    getAutomationValue(1, "Sequencer") > 0 && miningBlock?.isBuilt,
    5000 / (getAutomationValue(1, "Sequencer") || 1),
    sequenceBlock,
  );

  return {
    sequenceCounter,
    sequenceBlock,
  };
};
