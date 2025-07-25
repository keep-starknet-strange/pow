import { useState, useEffect, useCallback } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../context/Upgrades";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";
import { Block } from "../types/Chains";

export const useSequencer = (
  onBlockSequenced: () => void,
  getWorkingBlock: (chainId: number) => Block | undefined,
) => {
  const { notify } = useEventManager();
  const { user } = useFocEngine();
  const { powContract, getUserBlockClicks } = usePowContractConnector();
  const { getUpgradeValue, getAutomationValue } = useUpgrades();
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

  const sequenceBlock = useCallback(() => {
    setSequenceCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const blockDifficulty = getUpgradeValue(1, "L2 Finality");
      if (newCounter >= blockDifficulty) {
        onBlockSequenced();
        setSequencingProgress(0);
        return 0;
      } else {
        setSequencingProgress(newCounter / blockDifficulty);
        notify("SequenceClicked", {
          counter: newCounter,
          ignoreAction: getWorkingBlock(1)?.blockId === 0,
        });
        return newCounter;
      }
    });
  }, [
    onBlockSequenced,
    getUpgradeValue,
    notify,
  ]);
  useAutoClicker(
    getAutomationValue(1, "Sequencer") > 0,
    5000 / (getAutomationValue(1, "Sequencer") || 1),
    sequenceBlock,
  );

  return {
    sequenceCounter,
    sequencingProgress,
    sequenceBlock,
  };
};
