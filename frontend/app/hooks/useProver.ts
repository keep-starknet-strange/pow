import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useUpgrades } from "../context/Upgrades";
import { useAutoClicker } from "./useAutoClicker";

export const useProver = (
  onProve: () => void,
) => {
  const { notify } = useEventManager();
  const { getUpgradeValue, getAutomationValue } = useUpgrades();
  const { user } = useFocEngine();
  const { powContract, getUserProofClicks } = usePowContractConnector();
  const [proverCounter, setProverCounter] = useState(0);
  const [proverProgress, setProverProgress] = useState(0);

  useEffect(() => {
    const fetchProofCounter = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const clicks = await getUserProofClicks(0);
          setProverCounter(clicks || 0);
        } catch (error) {
          console.error("Error fetching mine counter:", error);
          setProverCounter(0);
        }
      }
    };
    fetchProofCounter();
  }, [powContract, user, getUserProofClicks]);

  const prove = useCallback(() => {
    setProverCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const proverDifficulty = getUpgradeValue(1, "Recursive Proving");
      if (newCounter >= proverDifficulty) {
        onProve();
        setProverProgress(0);
        notify("ProveDone", { counter: newCounter });
        return 0; // Reset counter after proving
      } else {
        setProverProgress(newCounter / proverDifficulty);
        notify("ProveClicked", { counter: newCounter });
        return newCounter;
      }
    });
  }, [onProve, getUpgradeValue, notify]);
  useAutoClicker(
    getAutomationValue(1, "Prover") > 0,
    5000 / (getAutomationValue(1, "Prover") || 1),
    prove,
  );

  return {
    proverCounter,
    proverProgress,
    prove,
  };
};
