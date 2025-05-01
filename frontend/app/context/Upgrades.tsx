<<<<<<< HEAD
import { createContext, useContext, useEffect, useState, useCallback } from "react";
=======
import { createContext, useContext, useEffect, useState } from "react";
import { Upgrade } from "../types/Upgrade";
import { newStakingPool } from "../types/StakingPool";
import upgradesJson from "../configs/upgrades.json";
import automationsJson from "../configs/automation.json";
import { useGameState } from "./GameState";
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11
import { useEventManager } from "../context/EventManager";
import { useBalance } from "../context/Balance";
import upgradesJson from "../configs/upgrades.json";
import automationsJson from "../configs/automations.json";
import prestigeJson from "../configs/prestige.json";

type UpgradesContextType = {
  // Map: chainId -> upgradeId -> Upgrade Level
  upgrades: { [chainId: number]: { [upgradeId: number]: number } };
  // Map: chainId -> automationId -> Automation Level
  automations: { [chainId: number]: { [automationId: number]: number } };
  upgrade: (chainId: number, upgradeId: number) => void;
  upgradeAutomation: (chainId: number, upgradeId: number) => void;
  currentPrestige: number;
  prestige: () => void;

  getUpgradeValue: (chainId: number, upgradeName: string) => number;
  getUpgradeValueAt: (chainId: number, upgradeId: number) => number;
  getNextUpgradeCost: (chainId: number, upgradeId: number) => number;
  getAutomationValue: (chainId: number, automationName: string) => number;
  getAutomationSpeedAt: (chainId: number, automationId: number) => number;
  getNextAutomationCost: (chainId: number, automationId: number) => number;
  getNextPrestigeCost: () => number;
};

export const useUpgrades = () => {
  const context = useContext(UpgradesContext);
  if (!context) {
    throw new Error("useUpgrades must be used within an UpgradesProvider");
  }
  return context;
}
const UpgradesContext = createContext<UpgradesContextType | undefined>(undefined);

export const UpgradesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [upgrades, setUpgrades] = useState<{ [chainId: number]: { [upgradeId: number]: number } }>({});
  const [automations, setAutomation] = useState<{ [chainId: number]: { [upgradeId: number]: number } }>({});
  const [currentPrestige, setCurrentPrestige] = useState<number>(0);
  const { notify } = useEventManager();
<<<<<<< HEAD
  const { tryBuy } = useBalance();
=======
  // TODO: Move upgradableGameState into this context?
  const { setGameState, upgradableGameState, setUpgradableGameState, addStakingPoolToGameState } = useGameState();
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11

  const resetUpgrades = () => {
    // Initialize upgrades
    const initUpgrades: { [chainId: number]: { [upgradeId: number]: number } } = {};
    for (const chainId in upgradesJson) {
      let chainIdInt: number;
      let upgradeJsonChain;
      if (chainId === "L1") {
        chainIdInt = 0;
        upgradeJsonChain = upgradesJson.L1;
      } else if (chainId === "L2") {
        chainIdInt = 1;
        upgradeJsonChain = upgradesJson.L2;
      } else {
        console.warn(`Unknown chainId: ${chainId}`);
        continue;
      }
      initUpgrades[chainIdInt] = {};
      // Initialize all upgrades to level -1
      for (const upgradeId in upgradeJsonChain) {
        initUpgrades[chainIdInt][upgradeId] = -1;
      }
    }
    setUpgrades(initUpgrades);
    const initAutomation: { [chainId: number]: { [upgradeId: number]: number } } = {};
    for (const chainId in automationsJson) {
      let chainIdInt: number;
      let automationJsonChain;
      if (chainId === "L1") {
        chainIdInt = 0;
        automationJsonChain = automationsJson.L1;
      } else if (chainId === "L2") {
        chainIdInt = 1;
        automationJsonChain = automationsJson.L2;
      } else {
        console.warn(`Unknown chainId: ${chainId}`);
        continue;
      }
      initAutomation[chainIdInt] = {};
      // Initialize all automations to level -1
      for (const upgradeId in automationJsonChain) {
        initAutomation[chainIdInt][upgradeId] = -1;
      }
    }
    setAutomation(initAutomation);
  };

  useEffect(() => {
    resetUpgrades();
  }, []);

<<<<<<< HEAD
  const upgrade = (chainId: number, upgradeId: number) => {
=======
  const addUpgrade = (chainId: number, upgradeId: number) => {
    let upgrade = null;
    if (chainId === 0) {
      upgrade = upgradesJson.L1[upgradeId];
    } else if (chainId === 1) {
      upgrade = upgradesJson.L2[upgradeId];
    } else if (chainId === 2) {
      upgrade = upgradesJson.staking[upgradeId];
    } else {
      console.warn(`Unknown chainId: ${chainId}`);
      return;
    }
    switch (upgrade.name) {
      case "Transaction Sorting":
        setUpgradableGameState((prev) => ({
          ...prev,
          sortTransactions: true
        }));
        break;
      case "Block Difficulty":
        setUpgradableGameState((prev) => ({
          ...prev,
          difficulty: prev.difficulty - 1
        }));
        break;
      case "Block Size":
        setUpgradableGameState((prev) => ({
          ...prev,
          blockSize: prev.blockSize + 1
        }));
        break;
      case "Block Reward":
        setUpgradableGameState((prev) => ({
          ...prev,
          blockReward: prev.blockReward * 2
        }));
        break;
      case "MEV Boost":
        setUpgradableGameState((prev) => ({
          ...prev,
          mevBoost: prev.mevScaling + 1
        }));
        break;
      case "Sequencer":
        setUpgradableGameState((prev) => ({
          ...prev,
          sequencerSpeed: prev.sequencerSpeed + 1
        }));
        break;
      case "Miner":
        setUpgradableGameState((prev) => ({
          ...prev,
          minerSpeed: prev.minerSpeed + 1
        }));
        break;
      case "Unlock L2s":
        setUpgradableGameState((prev) => ({
          ...prev,
          l2Transactions: true
        }));
        break;
      case "Unlock L2 Blobs":
        setUpgradableGameState((prev) => ({
          ...prev,
          l2Blobs: true,
        }));
        break;
      case "Dapp":
        setUpgradableGameState((prev) => ({
          ...prev,
          dapp: true,
        }));
        break;
      case "Inscriptions Metaprotocol":
        setUpgradableGameState((prev) => ({
          ...prev,
          inscriptionsMetaprotocol: true,
        }));
        break;
      case "Unlock Staking":
        setUpgradableGameState((prev) => ({
          ...prev,
          staking: true,
        }));
        addStakingPoolToGameState(newStakingPool(0, 0));
        break;
      default:
        console.warn(`Unknown upgrade: ${upgrade.name}`);
        break;
    }

    const currentLevel = upgrades[chainId][upgrade.id]?.level || 0;
    const newUpgrade = {
      ...upgrade,
      level: Math.min(currentLevel + 1, upgrade.costs.length),
    };

    const updatedUpgrades = { ...upgrades, [chainId]: { ...upgrades[chainId], [upgrade.id]: newUpgrade } };
    setUpgrades(updatedUpgrades);
    notify("UpgradePurchased", { upgrade: newUpgrade, allUpgrades: updatedUpgrades });
  };
  
  const updateUpgrade = (upgrade: Upgrade) => {
    setUpgrades((prevUpgrades) => ({
      ...prevUpgrades,
      [upgrade.id]: upgrade
    }));
  };

  const removeUpgrade = (upgrade: Upgrade) => {
>>>>>>> aa34c31fd97abb118ff5c6ee013847c4f8f44b11
    setUpgrades((prevUpgrades) => {
      const newUpgrades = { ...prevUpgrades };
      if (!newUpgrades[chainId]) {
        newUpgrades[chainId] = {};
      }
      // Check if already upgraded to the maximum level
      const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
      const upgrade = upgradeJsonChain.find(upgrade => upgrade.id === upgradeId);
      if (!upgrade) {
        console.warn(`Upgrade not found: ${upgradeId} for chainId: ${chainId}`);
        return newUpgrades;
      }
      const currentLevel = newUpgrades[chainId][upgradeId];
      if (currentLevel >= upgrade.values.length - 1) {
        console.warn(`Upgrade already at maximum level: ${upgradeId} for chainId: ${chainId}`);
        return newUpgrades;
      }
      const cost = upgrade.costs[currentLevel + 1];
      if(!tryBuy(cost)) return newUpgrades;
      // Increment upgrade level
      newUpgrades[chainId][upgradeId] = currentLevel + 1;
      notify("UpgradePurchased", { chainId, upgradeId, level: newUpgrades[chainId][upgradeId] });
      return newUpgrades;
    });
  }

  const upgradeAutomation = (chainId: number, automationId: number) => {
    setAutomation((prevAutomations) => {
      const newAutomations = { ...prevAutomations };
      if (!newAutomations[chainId]) {
        newAutomations[chainId] = {};
      }
      // Check if already upgraded to the maximum level
      const automationJsonChain = chainId === 0 ? automationsJson.L1 : automationsJson.L2;
      const automation = automationJsonChain.find(automation => automation.id === automationId);
      if (!automation) {
        console.warn(`Automation not found: ${automationId} for chainId: ${chainId}`);
        return newAutomations;
      }
      const currentLevel = newAutomations[chainId][automationId];
      if (currentLevel >= automation.levels.length - 1) {
        console.warn(`Automation already at maximum level: ${automationId} for chainId: ${chainId}`);
        return newAutomations;
      }
      const cost = automation.levels[currentLevel + 1].cost;
      if(!tryBuy(cost)) return newAutomations;
      // Increment automation level
      newAutomations[chainId][automationId] = currentLevel + 1;
      notify("AutomationPurchased", { chainId, automationId, level: newAutomations[chainId][automationId] });
      return newAutomations;
    });
  };

  const prestige = () => {
    setCurrentPrestige((prevPrestige) => {
      const nextPrestige = prevPrestige + 1;
      notify("PrestigePurchased", { prestigeLevel: nextPrestige });
      resetUpgrades();
      return nextPrestige;
    });
  }

  const getUpgradeValue = useCallback((chainId: number, upgradeName: string): number => {
    // Get the upgrade info
    const chainUpgrades = upgrades[chainId] || {};
    const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
    const upgrade = upgradeJsonChain.find(upgrade => upgrade.name === upgradeName);
    if (!upgrade || chainUpgrades[upgrade.id] === undefined) {
      console.warn(`Upgrade not found: ${upgradeName} for chainId: ${chainId}`);
      return 0;
    }

    const level = (chainUpgrades[upgrade.id] !== undefined ? chainUpgrades[upgrade.id] : -1);
    return level === -1 ? upgrade.baseValue : upgrade.values[level];
  }, [upgrades]);

  const getUpgradeValueAt = useCallback((chainId: number, upgradeId: number): number => {
    const chainUpgrades = upgrades[chainId] || {};
    const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
    const upgrade = upgradeJsonChain.find(upgrade => upgrade.id === upgradeId);
    if (!upgrade || chainUpgrades[upgradeId] === undefined) {
      console.warn(`Upgrade not found: ${upgradeId} for chainId: ${chainId}`);
      return 0;
    }

    const level = (chainUpgrades[upgradeId] !== undefined ? chainUpgrades[upgradeId] : -1);
    return level === -1 ? upgrade.baseValue : upgrade.values[level];
  }, [upgrades]);

  const getNextUpgradeCost = useCallback((chainId: number, upgradeId: number): number => {
    const chainUpgrades = upgrades[chainId] || {};
    const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
    const upgrade = upgradeJsonChain.find(upgrade => upgrade.id === upgradeId);
    if (!upgrade || chainUpgrades[upgradeId] === undefined) {
      console.warn(`Upgrade not found: ${upgradeId} for chainId: ${chainId}`);
      return 0;
    }

    const level = (chainUpgrades[upgradeId] !== undefined ? chainUpgrades[upgradeId] : -1);
    return upgrade.costs[level+1] || 0;
  }, [upgrades]);

  const getAutomationValue = useCallback((chainId: number, automationName: string): number => {
    // Get the automation info
    const chainAutomations = automations[chainId] || {};
    const automationJsonChain = chainId === 0 ? automationsJson.L1 : automationsJson.L2;
    const automation = automationJsonChain.find(automation => automation.name === automationName);
    if (!automation || chainAutomations[automation.id] === undefined) {
      console.warn(`Automation not found: ${automationName} for chainId: ${chainId}`);
      return 0;
    }

    const level = (chainAutomations[automation.id] !== undefined ? chainAutomations[automation.id] : -1);
    return level === -1 ? 0 : automation.levels[level].speed;
  }, [automations]);

  const getAutomationSpeedAt = useCallback((chainId: number, automationId: number): number => {
    const chainAutomations = automations[chainId] || {};
    const automationJsonChain = chainId === 0 ? automationsJson.L1 : automationsJson.L2;
    const automation = automationJsonChain.find(automation => automation.id === automationId);
    if (!automation || chainAutomations[automationId] === undefined) {
      console.warn(`Automation not found: ${automationId} for chainId: ${chainId}`);
      return 0;
    }

    const level = (chainAutomations[automationId] !== undefined ? chainAutomations[automationId] : -1);
    return level === -1 ? 0 : automation.levels[level].speed;
  }, [automations]);

  const getNextAutomationCost = useCallback((chainId: number, automationId: number): number => {
    const chainAutomations = automations[chainId] || {};
    const automationJsonChain = chainId === 0 ? automationsJson.L1 : automationsJson.L2;
    const automation = automationJsonChain.find(automation => automation.id === automationId);
    if (!automation || chainAutomations[automationId] === undefined) {
      console.warn(`Automation not found: ${automationId} for chainId: ${chainId}`);
      return 0;
    }

    const level = (chainAutomations[automationId] !== undefined ? chainAutomations[automationId] : -1);
    return automation.levels[level + 1]?.cost || 0;
  }, [automations]);

  const getNextPrestigeCost = useCallback((): number => {
    const prestigeCost = prestigeJson[currentPrestige + 1]?.cost || 0;
    return prestigeCost;
  }, [currentPrestige]);

  return (
    <UpgradesContext.Provider value={{
      upgrades, automations, upgrade, upgradeAutomation,
      getUpgradeValue, getUpgradeValueAt, getNextUpgradeCost,
      getAutomationValue, getAutomationSpeedAt, getNextAutomationCost,
      currentPrestige, prestige, getNextPrestigeCost
    }}>
      {children}
    </UpgradesContext.Provider>
  );
};
