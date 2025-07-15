import { useState, useEffect } from "react";
import { useEventManager } from "../context/EventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
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

  const sequenceBlock = () => {
    setSequenceCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      notify("SequenceClicked", { counter: newCounter });
      return newCounter;
    });
  };

  useEffect(() => {
    if (sequenceCounter === 0) return;
    const blockDifficulty = getUpgradeValue(1, "L2 Finality");
    setSequencingProgress(sequenceCounter / blockDifficulty);
    if (sequenceCounter >= blockDifficulty) {
      onBlockSequenced();
      setSequenceCounter(0);
      setSequencingProgress(0);
    }
  }, [sequenceCounter, getUpgradeValue]);

  const [shouldAutoClick, setShouldAutoClick] = useState(false);
  useEffect(() => {
    const workingBlock = getWorkingBlock(1);
    if (!workingBlock) {
      setShouldAutoClick(false);
      return;
    }
    if (workingBlock?.isBuilt && getAutomationValue(1, "Sequencer") > 0) {
      setShouldAutoClick(true);
    } else {
      setShouldAutoClick(false);
    }
  }, [getWorkingBlock, getAutomationValue]);
  useAutoClicker(
    shouldAutoClick,
    5000 / (getAutomationValue(1, "Sequencer") || 1),
    sequenceBlock,
  );

  return {
    sequenceCounter,
    sequencingProgress,
    sequenceBlock,
  };
};
