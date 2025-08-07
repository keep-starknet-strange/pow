import { useState, useEffect, useCallback } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useL2Store } from "../stores/useL2Store";
import { useAutoClicker } from "./useAutoClicker";

export const useDAConfirmer = (
  onDAConfirm: () => void,
  triggerDAAnimation?: () => void,
) => {
  const { notify } = useEventManager();
  const { user } = useFocEngine();
  const { powContract, getUserDaClicks } = usePowContractConnector();
  const { getAutomationValue } = useUpgrades();
  const [daConfirmCounter, setDaConfirmCounter] = useState(0);

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

  const { l2 } = useL2Store();
  const daIsBuilt = l2?.da.isBuilt;
  const daMaxSize = l2?.da.maxSize;
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
      if (newCounter <= daDifficulty) {
        return newCounter;
      } else {
        return prevCounter; // Prevent counter from exceeding difficulty
      }
    });
  }, [daIsBuilt, daMaxSize, triggerDAAnimation]);

  useEffect(() => {
    if (daConfirmCounter === daMaxSize) {
      onDAConfirm();
      notify("DaDone", { counter: daConfirmCounter });
      setDaConfirmCounter(0);
    } else if (daConfirmCounter > 0) {
      notify("DaClicked", { counter: daConfirmCounter });
    }
  }, [daConfirmCounter, daMaxSize]);

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
