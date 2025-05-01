import { useState, useEffect } from 'react';
import { useEventManager } from "../context/EventManager";
import { useUpgrades } from "../context/Upgrades";
import { useAutoClicker } from "./useAutoClicker";
import { L2DA } from "../types/L2";

export const useDAConfirmer = (
  onDAConfirm: () => void,
  getDa: () => L2DA | undefined,
) => {
  const { notify } = useEventManager();
  const { getUpgradeValue, getAutomationValue } = useUpgrades();
  const [daConfirmCounter, setDaConfirmCounter] = useState(0);
  const [daProgress, setDaConfirmProgress] = useState(0);

  const daConfirm = () => {
    setDaConfirmCounter(prevCounter => {
      const newCounter = prevCounter + 1;
      notify("DaClicked", { counter: newCounter });
      return newCounter;
    });
  }

  useEffect(() => {
    if (daConfirmCounter === 0) return;
    const blockDifficulty = getUpgradeValue(1, "DA compression");
    setDaConfirmProgress(daConfirmCounter / blockDifficulty);
    if (daConfirmCounter >= blockDifficulty) {
      onDAConfirm();
      notify("DaDone", { counter: daConfirmCounter });
      setDaConfirmCounter(0);
      setDaConfirmProgress(0);
    }
  }, [daConfirmCounter, getUpgradeValue]);

  const [shouldAutoClick, setShouldAutoClick] = useState(false);
  useEffect(() => {
    const da = getDa();
    if (!da) {
      setShouldAutoClick(false);
      return;
    }
    if (da?.isBuilt && getAutomationValue(1, "DA") > 0) {
      setShouldAutoClick(true);
    } else {
      setShouldAutoClick(false);
    }
  }, [getDa, getAutomationValue]);
  useAutoClicker(
    shouldAutoClick,
    5000 / (getAutomationValue(1, "DA") || 1),
    daConfirm
  );

  return {
    daConfirmCounter,
    daProgress,
    daConfirm
  };
}
