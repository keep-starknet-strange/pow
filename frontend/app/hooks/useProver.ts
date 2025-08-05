import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useL2Store } from "../stores/useL2Store";
import { useAutoClicker } from "./useAutoClicker";

export const useProver = (
  onProve: () => void,
  triggerProveAnimation?: () => void,
) => {
  const { notify } = useEventManager();
  const { getAutomationValue } = useUpgrades();
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
  const proverIsBuilt = l2?.prover.isBuilt;
  const proverMaxSize = l2?.prover.maxSize;
  const prove = useCallback(() => {
    if (!proverIsBuilt) {
      console.warn("Prover is not built yet.");
      return;
    }

    // Trigger animation if provided
    if (triggerProveAnimation) {
      triggerProveAnimation();
    }

    setProverCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const proverDifficulty = proverMaxSize || 1;
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
  }, [onProve, notify, proverIsBuilt, proverMaxSize, triggerProveAnimation]);

  // Reset prover progress when the prover is built
  useEffect(() => {
    setProverProgress(0);
    setProverCounter(0);
  }, [proverIsBuilt]);

  useAutoClicker(
    getAutomationValue(1, "Prover") > 0 && (proverIsBuilt || false),
    5000 / (getAutomationValue(1, "Prover") || 1),
    prove,
  );

  return {
    proverCounter,
    proverProgress,
    prove,
  };
};
