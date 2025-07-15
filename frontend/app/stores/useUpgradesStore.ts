import React, { useCallback } from "react";
import { create } from "zustand";
import { useEventManager } from "../context/EventManager";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useBalance } from "../stores/useBalanceStore";
import upgradesJson from "../configs/upgrades.json";
import automationsJson from "../configs/automations.json";
import prestigeJson from "../configs/prestige.json";

type UpgradesState = {
  // Map: chainId -> upgradeId -> Upgrade Level
  upgrades: { [chainId: number]: { [upgradeId: number]: number } };
  // Map: chainId -> automationId -> Automation Level
  automations: { [chainId: number]: { [automationId: number]: number } };
  currentPrestige: number;

  resetUpgrades: () => void;
  setUpgrades: (upgrades: {
    [chainId: number]: { [upgradeId: number]: number };
  }) => void;
  setAutomations: (automations: {
    [chainId: number]: { [automationId: number]: number };
  }) => void;
  setCurrentPrestige: (prestige: number) => void;
};

const useUpgradesStore = create<UpgradesState>((set, get) => ({
  upgrades: {},
  automations: {},
  currentPrestige: 0,

  setUpgrades: (upgrades) => set({ upgrades }),
  setAutomations: (automations) => set({ automations }),
  setCurrentPrestige: (prestige) => set({ currentPrestige: prestige }),

  resetUpgrades: () => {
    // Initialize upgrades
    const initUpgrades: { [chainId: number]: { [upgradeId: number]: number } } =
      {};
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
    set({ upgrades: initUpgrades });
    const initAutomation: {
      [chainId: number]: { [upgradeId: number]: number };
    } = {};
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
    set({ automations: initAutomation });
  },
}));

// curl http://localhost:8080/events/get-unique-with\?contractAddress\=0x3f521e989acabd697addbf1c456d10ae9a4f5ad8bb680cf843da0ad765b4b80\&eventType\=pow_game::upgrades::component::PowUpgradesComponent::UpgradeLevelUpdated\&uniqueKey\=upgrade_id -X POST -d "{\"chain_id\":0}"

export const useUpgrades = () => {
  const store = useUpgradesStore();
  const { notify } = useEventManager();
  const { tryBuy } = useBalance();
  const { user } = useFocEngine();
  const { powContract, getUserUpgradeLevels, getUserAutomationLevels } =
    usePowContractConnector();

  // Subscribe to store changes for reactive updates
  const upgrades = useUpgradesStore((state) => state.upgrades);
  const automations = useUpgradesStore((state) => state.automations);
  const currentPrestige = useUpgradesStore((state) => state.currentPrestige);

  const fetchUpgradeLevels = useCallback(async () => {
    if (!user) return;
    if (!powContract) return;
    // TODO: Hardcoded chain ids
    const chainIds = [0, 1]; // L1 and L2
    for (const chainId of chainIds) {
      /* TODO: Use Foc engine?
      const events = await getUniqueEventsWith(
        powGameContractAddress,
        "pow_game::upgrades::component::PowUpgradesComponent::UpgradeLevelUpdated",
        "upgrade_id",
        { chain_id: chainId, user: user.account_address }
      );
      if (!events) {
        console.warn(`No upgrade events found for chainId: ${chainId}`);
        continue;
      }
      const upgradesFeeLevels: { upgradeId: number, level: number }[] = events.map((event: any) => ({
        upgradeId: event.upgrade_id,
        level: event.new_level
      }));
      setUpgrades((prevUpgrades) => {
        const newUpgrades = { ...prevUpgrades };
        if (!newUpgrades[chainId]) {
          newUpgrades[chainId] = {};
        }
        upgradesFeeLevels.forEach(({ upgradeId, level }) => {
          newUpgrades[chainId][upgradeId] = level - 1; // Convert to zero-based index
        });
        return newUpgrades;
      });
      */
      const userUpgradesConfig =
        chainId == 0 ? upgradesJson.L1 : upgradesJson.L2;
      const upgradesCount = userUpgradesConfig.length;
      const userUpgradeLevels = await getUserUpgradeLevels(
        chainId,
        upgradesCount,
      );
      if (!userUpgradeLevels) {
        continue;
      }
      const currentUpgrades = useUpgradesStore.getState().upgrades;
      const newUpgrades = { ...currentUpgrades };
      if (!newUpgrades[chainId]) {
        newUpgrades[chainId] = {};
      }
      userUpgradeLevels.forEach((level: number, upgradeId: number) => {
        newUpgrades[chainId][upgradeId] = level - 1; // Already zero-based index
      });
      useUpgradesStore.getState().setUpgrades(newUpgrades);
    }
  }, [user, powContract, getUserUpgradeLevels]);

  const fetchAutomationLevels = useCallback(async () => {
    if (!user) return;
    if (!powContract) return;
    // TODO: Hardcoded chain ids
    const chainIds = [0, 1]; // L1 and L2
    for (const chainId of chainIds) {
      /* TODO: Use Foc engine?
      const events = await getUniqueEventsWith(
        powGameContractAddress,
        "pow_game::upgrades::component::PowUpgradesComponent::AutomationLevelUpdated",
        "automation_id",
        { chain_id: chainId, user: user.account_address }
      );
      if (!events) {
        console.warn(`No automation events found for chainId: ${chainId}`);
        continue;
      }
      const automationsFeeLevels: { automationId: number, level: number }[] = events.map((event: any) => ({
        automationId: event.automation_id,
        level: event.new_level
      }));
      setAutomation((prevAutomations) => {
        const newAutomations = { ...prevAutomations };
        if (!newAutomations[chainId]) {
          newAutomations[chainId] = {};
        }
        automationsFeeLevels.forEach(({ automationId, level }) => {
          newAutomations[chainId][automationId] = level - 1; // Convert to zero-based index
        });
        return newAutomations;
      });
      */
      const userAutomationsConfig =
        chainId == 0 ? automationsJson.L1 : automationsJson.L2;
      const automationsCount = userAutomationsConfig.length;
      const userAutomationLevels = await getUserAutomationLevels(
        chainId,
        automationsCount,
      );
      if (!userAutomationLevels) {
        continue;
      }
      const currentAutomations = useUpgradesStore.getState().automations;
      const newAutomations = { ...currentAutomations };
      if (!newAutomations[chainId]) {
        newAutomations[chainId] = {};
      }
      userAutomationLevels.forEach((level: number, automationId: number) => {
        newAutomations[chainId][automationId] = level - 1; // Already zero-based index
      });
      useUpgradesStore.getState().setAutomations(newAutomations);
    }
  }, [user, powContract, getUserAutomationLevels]);

  const upgrade = useCallback(
    (chainId: number, upgradeId: number) => {
      const newUpgrades = { ...upgrades };
      if (!newUpgrades[chainId]) {
        newUpgrades[chainId] = {};
      }
      // Check if already upgraded to the maximum level
      const upgradeJsonChain =
        chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
      const upgrade = upgradeJsonChain.find(
        (upgrade) => upgrade.id === upgradeId,
      );
      if (!upgrade) {
        console.warn(`Upgrade not found: ${upgradeId} for chainId: ${chainId}`);
        return;
      }
      const currentLevel = newUpgrades[chainId][upgradeId];
      if (currentLevel >= upgrade.values.length - 1) {
        console.warn(
          `Upgrade already at maximum level: ${upgradeId} for chainId: ${chainId}`,
        );
        return;
      }
      const cost = upgrade.costs[currentLevel + 1];
      if (!tryBuy(cost)) return;
      // Increment upgrade level
      newUpgrades[chainId][upgradeId] = currentLevel + 1;
      notify("UpgradePurchased", {
        chainId,
        upgradeId,
        level: newUpgrades[chainId][upgradeId],
        newUpgrades: newUpgrades,
      });
      useUpgradesStore.getState().setUpgrades(newUpgrades);
    },
    [upgrades, tryBuy, notify],
  );

  const upgradeAutomation = useCallback(
    (chainId: number, automationId: number) => {
      const newAutomations = { ...automations };
      if (!newAutomations[chainId]) {
        newAutomations[chainId] = {};
      }
      // Check if already upgraded to the maximum level
      const automationJsonChain =
        chainId === 0 ? automationsJson.L1 : automationsJson.L2;
      const automation = automationJsonChain.find(
        (automation) => automation.id === automationId,
      );
      if (!automation) {
        console.warn(
          `Automation not found: ${automationId} for chainId: ${chainId}`,
        );
        return;
      }
      const currentLevel = newAutomations[chainId][automationId];
      if (currentLevel >= automation.levels.length - 1) {
        console.warn(
          `Automation already at maximum level: ${automationId} for chainId: ${chainId}`,
        );
        return;
      }
      const cost = automation.levels[currentLevel + 1].cost;
      if (!tryBuy(cost)) return;
      // Increment automation level
      newAutomations[chainId][automationId] = currentLevel + 1;
      notify("AutomationPurchased", {
        chainId,
        automationId,
        level: newAutomations[chainId][automationId],
      });
      useUpgradesStore.getState().setAutomations(newAutomations);
    },
    [automations, tryBuy, notify],
  );

  const prestige = useCallback(() => {
    const nextPrestige = currentPrestige + 1;
    notify("PrestigePurchased", { prestigeLevel: nextPrestige });
    useUpgradesStore.getState().resetUpgrades();
    useUpgradesStore.getState().setCurrentPrestige(nextPrestige);
  }, [currentPrestige, notify]);

  const getUpgradeValue = useCallback(
    (chainId: number, upgradeName: string): number => {
      // Get the upgrade info
      const chainUpgrades = upgrades[chainId] || {};
      const upgradeJsonChain =
        chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
      const upgrade = upgradeJsonChain.find(
        (upgrade) => upgrade.name === upgradeName,
      );
      if (!upgrade || chainUpgrades[upgrade.id] === undefined) {
        console.warn(
          `Upgrade not found: ${upgradeName} for chainId: ${chainId}`,
        );
        return 0;
      }

      const level =
        chainUpgrades[upgrade.id] !== undefined
          ? chainUpgrades[upgrade.id]
          : -1;
      return level === -1 ? upgrade.baseValue : upgrade.values[level];
    },
    [upgrades],
  );

  const getUpgradeValueAt = useCallback(
    (chainId: number, upgradeId: number): number => {
      const chainUpgrades = upgrades[chainId] || {};
      const upgradeJsonChain =
        chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
      const upgrade = upgradeJsonChain.find(
        (upgrade) => upgrade.id === upgradeId,
      );
      if (!upgrade || chainUpgrades[upgradeId] === undefined) {
        console.warn(`Upgrade not found: ${upgradeId} for chainId: ${chainId}`);
        return 0;
      }

      const level =
        chainUpgrades[upgradeId] !== undefined ? chainUpgrades[upgradeId] : -1;
      return level === -1 ? upgrade.baseValue : upgrade.values[level];
    },
    [upgrades],
  );

  const getNextUpgradeCost = useCallback(
    (chainId: number, upgradeId: number): number => {
      const chainUpgrades = upgrades[chainId] || {};
      const upgradeJsonChain =
        chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
      const upgrade = upgradeJsonChain.find(
        (upgrade) => upgrade.id === upgradeId,
      );
      if (!upgrade || chainUpgrades[upgradeId] === undefined) {
        console.warn(`Upgrade not found: ${upgradeId} for chainId: ${chainId}`);
        return 0;
      }

      const level =
        chainUpgrades[upgradeId] !== undefined ? chainUpgrades[upgradeId] : -1;
      return upgrade.costs[level + 1] || 0;
    },
    [upgrades],
  );

  const getAutomationValue = useCallback(
    (chainId: number, automationName: string): number => {
      // Get the automation info
      const chainAutomations = automations[chainId] || {};
      const automationJsonChain =
        chainId === 0 ? automationsJson.L1 : automationsJson.L2;
      const automation = automationJsonChain.find(
        (automation) => automation.name === automationName,
      );
      if (!automation || chainAutomations[automation.id] === undefined) {
        console.warn(
          `Automation not found: ${automationName} for chainId: ${chainId}`,
        );
        return 0;
      }

      const level =
        chainAutomations[automation.id] !== undefined
          ? chainAutomations[automation.id]
          : -1;
      return level === -1 ? 0 : automation.levels[level]?.speed | 0;
    },
    [automations],
  );

  const getAutomationSpeedAt = useCallback(
    (chainId: number, automationId: number): number => {
      const chainAutomations = automations[chainId] || {};
      const automationJsonChain =
        chainId === 0 ? automationsJson.L1 : automationsJson.L2;
      const automation = automationJsonChain.find(
        (automation) => automation.id === automationId,
      );
      if (!automation || chainAutomations[automationId] === undefined) {
        console.warn(
          `Automation not found: ${automationId} for chainId: ${chainId}`,
        );
        return 0;
      }

      const level =
        chainAutomations[automationId] !== undefined
          ? chainAutomations[automationId]
          : -1;
      return level === -1 ? 0 : automation.levels[level].speed;
    },
    [automations],
  );

  const getNextAutomationCost = useCallback(
    (chainId: number, automationId: number): number => {
      const chainAutomations = automations[chainId] || {};
      const automationJsonChain =
        chainId === 0 ? automationsJson.L1 : automationsJson.L2;
      const automation = automationJsonChain.find(
        (automation) => automation.id === automationId,
      );
      if (!automation || chainAutomations[automationId] === undefined) {
        console.warn(
          `Automation not found: ${automationId} for chainId: ${chainId}`,
        );
        return 0;
      }

      const level =
        chainAutomations[automationId] !== undefined
          ? chainAutomations[automationId]
          : -1;
      return automation.levels[level + 1]?.cost || 0;
    },
    [automations],
  );

  const getNextPrestigeCost = useCallback((): number => {
    const prestigeCost = prestigeJson[currentPrestige + 1]?.cost || 0;
    return prestigeCost;
  }, [currentPrestige]);

  // Initialize store on first mount
  React.useEffect(() => {
    const currentState = useUpgradesStore.getState();
    if (Object.keys(currentState.upgrades).length === 0) {
      useUpgradesStore.getState().resetUpgrades();
    }
  }, []);

  React.useEffect(() => {
    if (!user || !powContract) return;

    fetchUpgradeLevels();
    fetchAutomationLevels();
  }, [user, powContract]);

  return {
    upgrades,
    automations,
    upgrade,
    upgradeAutomation,
    getUpgradeValue,
    getUpgradeValueAt,
    getNextUpgradeCost,
    getAutomationValue,
    getAutomationSpeedAt,
    getNextAutomationCost,
    currentPrestige,
    prestige,
    getNextPrestigeCost,
  };
};

export default useUpgradesStore;
