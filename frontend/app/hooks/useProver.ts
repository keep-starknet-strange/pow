import { useState, useEffect } from "react";
import { useEventManager } from "../context/EventManager";
import { useUpgrades } from "../context/Upgrades";
import { useAutoClicker } from "./useAutoClicker";
import { L2Prover } from "../types/L2";

export const useProver = (
  onProve: () => void,
  getProver: () => L2Prover | undefined,
) => {
  const { notify } = useEventManager();
  const { getUpgradeValue, getAutomationValue } = useUpgrades();
  const [proverCounter, setProverCounter] = useState(0);
  const [proverProgress, setProverProgress] = useState(0);

  const prove = () => {
    setProverCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      notify("ProveClicked", { counter: newCounter });
      return newCounter;
    });
  };

  useEffect(() => {
    if (proverCounter === 0) return;
    const blockDifficulty = getUpgradeValue(1, "Recursive Proving");
    setProverProgress(proverCounter / blockDifficulty);
    if (proverCounter >= blockDifficulty) {
      onProve();
      notify("ProveDone", { counter: proverCounter });
      setProverCounter(0);
      setProverProgress(0);
    }
  }, [proverCounter, getUpgradeValue]);

  const [shouldAutoClick, setShouldAutoClick] = useState(false);
  useEffect(() => {
    const prover = getProver();
    if (!prover) {
      setShouldAutoClick(false);
      return;
    }
    if (prover?.isBuilt && getAutomationValue(1, "Prover") > 0) {
      setShouldAutoClick(true);
    } else {
      setShouldAutoClick(false);
    }
  }, [getProver, getAutomationValue]);
  useAutoClicker(
    shouldAutoClick,
    5000 / (getAutomationValue(1, "Prover") || 1),
    prove,
  );

  return {
    proverCounter,
    proverProgress,
    prove,
  };
};
