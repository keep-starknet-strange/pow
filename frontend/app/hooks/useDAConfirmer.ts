import { useCallback, useState, useEffect } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useL2Store } from "../stores/useL2Store";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useAutoClicker } from "./useAutoClicker";

export const useDAConfirmer = (
  onDAConfirm: () => void,
  triggerDAAnimation?: () => void,
) => {
  const { notifyImmediate } = useEventManager();
  const { getAutomationValue } = useUpgrades();
  const { user } = useFocEngine();
  const { powContract, getUserDaClicks } = usePowContractConnector();
  const { l2 } = useL2Store();
  const daIsBuilt = l2?.da.isBuilt;
  const daDifficulty = l2?.da.maxSize || 1;
  const [daConfirmCounter, setDaConfirmCounter] = useState(0);

  useEffect(() => {
    const fetchDaCounter = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const clicks = await getUserDaClicks(1);
          setDaConfirmCounter(clicks || 0);
        } catch (error) {
          if (__DEV__) console.error("Error fetching da counter:", error);
          setDaConfirmCounter(0);
        }
      }
    };
    fetchDaCounter();
  }, [powContract, user, getUserDaClicks]);

  const daConfirm = useCallback(() => {
    if (!daIsBuilt) {
      if (__DEV__) console.warn("Data Availability is not built yet.");
      return;
    }

    // Trigger animation if provided
    if (triggerDAAnimation) {
      triggerDAAnimation();
    }
    // Batch state updates to prevent multiple rerenders
    setDaConfirmCounter((prevCounter) => {
      const newCounter = prevCounter + 1;

      if (newCounter < daDifficulty) {
        notifyImmediate("DaClicked", {
          counter: newCounter,
          difficulty: daDifficulty,
        });
        return newCounter;
      } else if (newCounter === daDifficulty) {
        return newCounter;
      } else {
        return prevCounter; // Prevent incrementing beyond difficulty
      }
    });
  }, [
    triggerDAAnimation,
    daIsBuilt,
    daDifficulty,
    daConfirmCounter,
    notifyImmediate,
    onDAConfirm,
  ]);

  useEffect(() => {
    if (daConfirmCounter === daDifficulty) {
      onDAConfirm();
      setDaConfirmCounter(0);
    }
  }, [daDifficulty, daConfirmCounter, onDAConfirm]);

  useAutoClicker(
    getAutomationValue(1, "DA") > 0 && (daIsBuilt || false),
    5000 / (getAutomationValue(1, "DA") || 1),
    daConfirm,
  );

  return {
    daConfirmCounter,
    daConfirm,
  };
};
