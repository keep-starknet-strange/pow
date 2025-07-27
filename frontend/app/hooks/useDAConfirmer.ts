import { useState, useEffect, useCallback } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useAutoClicker } from "./useAutoClicker";

export const useDAConfirmer = (
  onDAConfirm: () => void,
) => {
  const { notify } = useEventManager();
  const { user } = useFocEngine();
  const { powContract, getUserDaClicks } = usePowContractConnector();
  const { getUpgradeValue, getAutomationValue } = useUpgrades();
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

  const daConfirm = useCallback(() => {
    setDaConfirmCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const daDifficulty = getUpgradeValue(1, "DA compression");
      if (newCounter >= daDifficulty) {
        onDAConfirm();
        setDaConfirmProgress(0);
        notify("DaDone", { counter: newCounter });
        return 0; // Reset counter after confirmation
      } else {
        setDaConfirmProgress(newCounter / daDifficulty);
        notify("DaClicked", { counter: newCounter });
        return newCounter;
      }
    });
  }, [onDAConfirm, getUpgradeValue, notify]);
  useAutoClicker(
    getAutomationValue(1, "DA") > 0,
    5000 / (getAutomationValue(1, "DA") || 1),
    daConfirm,
  );

  return {
    daConfirmCounter,
    daProgress,
    daConfirm,
  };
};
