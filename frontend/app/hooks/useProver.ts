import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useL2Store } from "../stores/useL2Store";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";

export const useProver = (
  onProve: () => void,
  triggerProveAnimation?: () => void,
) => {
  const { notify } = useEventManager();
  const { getAutomationValue } = useUpgrades();
  const { user } = useFocEngine();
  const { powContract, getUserProofClicks } = usePowContractConnector();
  const { l2 } = useL2Store();
  const proverDifficulty = l2?.prover.maxSize || 1;
  const [proverCounter, setProverCounter] = useState(0);

  useEffect(() => {
    const fetchProofCounter = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const clicks = await getUserProofClicks(1);
          setProverCounter(clicks || 0);
        } catch (error) {
          if (__DEV__) console.error("Error fetching proof counter:", error);
          setProverCounter(0);
        }
      }
    };
    fetchProofCounter();
  }, [powContract, user, getUserProofClicks]);

  const prove = useCallback(() => {
    const currentL2Proof = useL2Store.getState().l2?.prover;
    const proverIsBuilt = currentL2Proof?.isBuilt || false;

    if (!proverIsBuilt) {
      if (__DEV__) console.warn("Prover is not built yet.");
      return;
    }

    // Trigger animation if provided
    if (triggerProveAnimation) {
      triggerProveAnimation();
    }
    // Batch state updates to prevent multiple rerenders
    setProverCounter((prevCounter) => {
      const newCounter = prevCounter + 1;

      if (newCounter < proverDifficulty) {
        notify("ProveClicked", {
          counter: newCounter,
          difficulty: proverDifficulty,
        });
        return newCounter;
      } else if (newCounter === proverDifficulty) {
        return newCounter;
      } else {
        return prevCounter; // Prevent incrementing beyond difficulty
      }
    });
  }, [triggerProveAnimation, proverDifficulty, proverCounter, notify, onProve]);

  useEffect(() => {
    if (proverCounter === proverDifficulty) {
      onProve();
      setProverCounter(0);
    }
  }, [proverDifficulty, proverCounter, onProve]);

  useAutoClicker(
    getAutomationValue(1, "Prover") > 0 && (l2?.prover.isBuilt || false),
    5000 / (getAutomationValue(1, "Prover") || 1),
    prove,
  );

  return {
    proverCounter,
    prove,
  };
};
