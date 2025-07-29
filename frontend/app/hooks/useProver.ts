import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useL2Store } from "../stores/useL2Store";
import { useAutoClicker } from "./useAutoClicker";

export const useProver = (onProve: () => void) => {
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

  const { l2 } = useL2Store();
  const prove = useCallback(() => {
    if (!l2?.prover.isBuilt) {
      console.warn("Prover is not built yet.");
      return;
    }
    setProverCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const proverDifficulty = getUpgradeValue(1, "Recursive Proving");
      if (newCounter == proverDifficulty) {
        onProve();
        setProverProgress(1);
        notify("ProveDone", { counter: newCounter });
        return 0; // Reset counter after proving
      } else if (newCounter < proverDifficulty) {
        setProverProgress(newCounter / proverDifficulty);
        notify("ProveClicked", { counter: newCounter });
        return newCounter;
      } else {
        return prevCounter; // Do not increment beyond difficulty
      }
    });
  }, [onProve, getUpgradeValue, notify, l2?.prover.isBuilt]);

  // Reset prover progress when the prover is built
  useEffect(() => {
    setProverProgress(0);
    setProverCounter(0);
  }, [l2?.prover.isBuilt]);

  useAutoClicker(
    getAutomationValue(1, "Prover") > 0 && (l2?.prover.isBuilt || false),
    5000 / (getAutomationValue(1, "Prover") || 1),
    prove,
  );

  return {
    proverCounter,
    proverProgress,
    prove,
  };
};
