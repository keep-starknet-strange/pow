import { useState, useEffect, useCallback } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useL2Store } from "../stores/useL2Store";
import { useAutoClicker } from "./useAutoClicker";
import { useShallow } from "zustand/react/shallow";

export const useDAConfirmer = (
  onDAConfirm: () => void,
  triggerDAAnimation?: () => void,
) => {
  const { notify } = useEventManager();
  const { user } = useFocEngine();
  const { powContract, getUserDaClicks } = usePowContractConnector();
  const { getAutomationValue } = useUpgrades();
  const [daConfirmCounter, setDaConfirmCounter] = useState(0);
  const [daProgress, setDaConfirmProgress] = useState(0);

  useEffect(() => {
    const fetchDaCounter = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const clicks = await getUserDaClicks(1);
          setDaConfirmCounter(clicks || 0);
        } catch (error) {
          console.error("Error fetching mine counter:", error);
          setDaConfirmCounter(0);
        }
      }
    };
    fetchDaCounter();
  }, [powContract, user, getUserDaClicks]);

  // Shallow state management: only re-render when DA properties change
  const [daIsBuilt, daMaxSize] = useL2Store(
    useShallow((state) => [state.l2?.da.isBuilt, state.l2?.da.maxSize]),
  );
  const daConfirm = useCallback(() => {
    if (!daIsBuilt) {
      console.warn("Data Availability is not built yet.");
      return;
    }

    // Trigger animation if provided
    if (triggerDAAnimation) {
      triggerDAAnimation();
    }

    setDaConfirmCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const daDifficulty = daMaxSize || 1;
      if (newCounter == daDifficulty) {
        onDAConfirm();
        setDaConfirmProgress(1);
        notify("DaDone", { counter: newCounter });
        return newCounter;
      } else if (newCounter < daDifficulty) {
        setDaConfirmProgress(newCounter / daDifficulty);
        notify("DaClicked", { counter: newCounter });
        return newCounter;
      } else {
        return prevCounter; // Prevent counter from exceeding difficulty
      }
    });
  }, [onDAConfirm, notify, daIsBuilt, daMaxSize, triggerDAAnimation]);

  // Reset da confirm progress when the DA is built
  useEffect(() => {
    setDaConfirmProgress(0);
    setDaConfirmCounter(0);
  }, [daIsBuilt]);

  useAutoClicker(
    getAutomationValue(1, "DA") > 0 && (daIsBuilt || false),
    5000 / (getAutomationValue(1, "DA") || 1),
    daConfirm,
  );

  return {
    daConfirmCounter,
    daProgress,
    daConfirm,
  };
};
