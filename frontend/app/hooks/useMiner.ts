import { useState, useEffect } from "react";
import { useEventManager } from "../context/EventManager";
import { useUpgrades } from "../context/Upgrades";
import { useAutoClicker } from "./useAutoClicker";
import { Block } from "../types/Chains";

export const useMiner = (
  onBlockMined: () => void,
  getWorkingBlock: (chainId: number) => Block | undefined,
) => {
  const { notify } = useEventManager();
  const { getUpgradeValue, getAutomationValue } = useUpgrades();
  const [mineCounter, setMineCounter] = useState(0);
  const [miningProgress, setMiningProgress] = useState(0);

  const mineBlock = () => {
    setMineCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      const blockDifficulty = getUpgradeValue(0, "Block Difficulty");
      notify("MineClicked", {
        counter: newCounter,
        difficulty: blockDifficulty,
      });
      return newCounter;
    });
  };

  useEffect(() => {
    if (mineCounter === 0) return;
    const blockDifficulty = getUpgradeValue(0, "Block Difficulty");
    setMiningProgress(mineCounter / blockDifficulty);
    if (mineCounter >= blockDifficulty) {
      onBlockMined();
      setMineCounter(0);
      setMiningProgress(0);
    }
  }, [mineCounter, getUpgradeValue]);

  const [shouldAutoClick, setShouldAutoClick] = useState(false);
  useEffect(() => {
    const workingBlock = getWorkingBlock(0);
    if (workingBlock?.isBuilt && getAutomationValue(0, "Miner") > 0) {
      setShouldAutoClick(true);
    } else {
      setShouldAutoClick(false);
    }
  }, [getWorkingBlock, getAutomationValue]);
  useAutoClicker(
    shouldAutoClick,
    5000 / (getAutomationValue(0, "Miner") || 1),
    mineBlock,
  );

  return {
    mineCounter,
    miningProgress,
    mineBlock,
  };
};
