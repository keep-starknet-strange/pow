import { create } from "zustand";
import { useEventManager } from "@/app/stores/useEventManager";
import { useBalanceStore } from "./useBalanceStore";
import upgradesJson from "../configs/upgrades.json";
import automationsJson from "../configs/automations.json";
import prestigeJson from "../configs/prestige.json";
import { Contract, Call } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import { useL2Store } from "./useL2Store";
import { useTransactionsStore } from "./useTransactionsStore";
import { useGameStore } from "./useGameStore";
import { useOnchainActions } from "./useOnchainActions";
import { useTransactionPauseStore } from "./useTransactionPauseStore";

interface UpgradesState {
  // Map: chainId -> upgradeId -> Upgrade Level
  upgrades: { [chainId: number]: { [upgradeId: number]: number } };
  // Map: chainId -> automationId -> Automation Level
  automations: { [chainId: number]: { [automationId: number]: number } };
  currentPrestige: number;
  canPrestige: boolean;
  isInitialized: boolean;
  setIsInitialized: (initialized: boolean) => void;

  // Actions
  upgrade: (chainId: number, upgradeId: number) => void;
  upgradeAutomation: (chainId: number, upgradeId: number) => void;
  prestige: () => Promise<void>;

  // Getters
  canUnlockUpgrade: (chainId: number, upgradeId: number) => boolean;
  getUpgradeValue: (chainId: number, upgradeName: string) => number;
  getUpgradeLevel: (chainId: number, upgradeName: string) => number;
  getUpgradeValueAt: (chainId: number, upgradeId: number) => number;
  getNextUpgradeCost: (chainId: number, upgradeId: number) => number;
  getAutomationValue: (chainId: number, automationName: string) => number;
  getAutomationSpeedAt: (chainId: number, automationId: number) => number;
  getNextAutomationCost: (chainId: number, automationId: number) => number;
  getNextPrestigeCost: () => number;
  isMaxPrestige: () => boolean;
  getMaxPrestige: () => number;
  getPrestigeScaler: () => number;

  // Initialization
  resetUpgrades: () => void;
  initializeUpgrades: (
    user: FocAccount | null,
    powContract: Contract | null,
    getUserUpgradeLevels: (
      chainId: number,
      upgradesCount: number,
    ) => Promise<number[] | undefined>,
    getUserAutomationLevels: (
      chainId: number,
      automationsCount: number,
    ) => Promise<number[] | undefined>,
    getUserPrestige: () => Promise<number | undefined>,
    getUniqueEventsWith?: (
      contractAddress: string,
      eventType: string,
      uniqueKey: string,
      filters: any,
    ) => Promise<any>,
  ) => Promise<void>;
  checkCanPrestige: () => void;
}

// curl http://localhost:8080/events/get-unique-with\?contractAddress\=0x3f521e989acabd697addbf1c456d10ae9a4f5ad8bb680cf843da0ad765b4b80\&eventType\=pow_game::upgrades::component::PowUpgradesComponent::UpgradeLevelUpdated\&uniqueKey\=upgrade_id -X POST -d "{\"chain_id\":0}"

export const useUpgradesStore = create<UpgradesState>((set, get) => ({
  upgrades: {},
  automations: {},
  currentPrestige: 0,
  canPrestige: false,
  isInitialized: false,
  setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),

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

    set({
      upgrades: initUpgrades,
      automations: initAutomation,
    });
  },

  initializeUpgrades: async (
    user,
    powContract,
    getUserUpgradeLevels,
    getUserAutomationLevels,
    getUserPrestige,
    getUniqueEventsWith,
  ) => {
    const { resetUpgrades } = get();
    resetUpgrades();

    if (!user || !powContract) return;

    // Fetch and set on-chain prestige to keep currentPrestige consistent across the app
    try {
      const prestige = await getUserPrestige();
      if (typeof prestige === "number") {
        set({ currentPrestige: prestige });
      }
    } catch (error) {
      console.error("Failed to initialize currentPrestige:", error);
    }

    const chainIds = [0, 1]; // L1 and L2

    // Fetch upgrade levels
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
      set((state) => {
        const newUpgrades = { ...state.upgrades };
        if (!newUpgrades[chainId]) {
          newUpgrades[chainId] = {};
        }
        upgradesFeeLevels.forEach(({ upgradeId, level }) => {
          newUpgrades[chainId][upgradeId] = level - 1; // Convert to zero-based index
        });
        return { upgrades: newUpgrades };
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
      set((state) => {
        const newUpgrades = { ...state.upgrades };
        if (!newUpgrades[chainId]) {
          newUpgrades[chainId] = {};
        }
        userUpgradeLevels.forEach((level: number, upgradeId: number) => {
          newUpgrades[chainId][upgradeId] = level - 1; // Already zero-based index
        });
        return { upgrades: newUpgrades };
      });
    }

    // Fetch automation levels
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
      set((state) => {
        const newAutomations = { ...state.automations };
        if (!newAutomations[chainId]) {
          newAutomations[chainId] = {};
        }
        automationsFeeLevels.forEach(({ automationId, level }) => {
          newAutomations[chainId][automationId] = level - 1; // Convert to zero-based index
        });
        return { automations: newAutomations };
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
      set((state) => {
        const newAutomations = { ...state.automations };
        if (!newAutomations[chainId]) {
          newAutomations[chainId] = {};
        }
        userAutomationLevels.forEach((level: number, automationId: number) => {
          newAutomations[chainId][automationId] = level - 1; // Already zero-based index
        });
        return { automations: newAutomations };
      });
    }

    // Mark as initialized
    set({ isInitialized: true });
  },

  upgrade: (chainId: number, upgradeId: number) => {
    const { canUnlockUpgrade, upgrades } = get();

    if (!canUnlockUpgrade(chainId, upgradeId)) {
      useEventManager.getState().notify("InvalidPurchase");
      return;
    }

    const newUpgrades = { ...upgrades };
    if (!newUpgrades[chainId]) {
      newUpgrades[chainId] = {};
    }

    // Check if already upgraded to the maximum level
    const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
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
    if (!useBalanceStore.getState().tryBuy(cost)) return;

    // Increment upgrade level
    newUpgrades[chainId][upgradeId] = currentLevel + 1;

    useEventManager.getState().notify("UpgradePurchased", {
      chainId,
      upgradeId,
      level: newUpgrades[chainId][upgradeId],
      newUpgrades: newUpgrades,
    });

    set({ upgrades: newUpgrades });
  },

  upgradeAutomation: (chainId: number, automationId: number) => {
    const { automations } = get();
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
    if (!useBalanceStore.getState().tryBuy(cost)) return;

    // Increment automation level
    newAutomations[chainId][automationId] = currentLevel + 1;

    useEventManager.getState().notify("AutomationPurchased", {
      chainId,
      automationId,
      level: newAutomations[chainId][automationId],
    });

    set({ automations: newAutomations });
  },

  checkCanPrestige: () => {
    const { currentPrestige } = get();
    const maxPrestige = prestigeJson.length - 1;

    // Check if already at max prestige
    if (currentPrestige >= maxPrestige) {
      set({ canPrestige: false });
      return;
    }

    // Check if last dapp is unlocked
    const { dappFeeLevels } = useTransactionsStore.getState();
    const dappLevels = dappFeeLevels[1];
    if (!dappLevels) {
      set({ canPrestige: false });
      return;
    }
    const lastDappId = Math.max(...Object.keys(dappLevels).map(Number));
    if (dappLevels[lastDappId] < 0) {
      set({ canPrestige: false });
      return;
    }
    set({ canPrestige: true });
    return;
  },

  prestige: async () => {
    const { currentPrestige, isMaxPrestige, getNextPrestigeCost } = get();

    // Check if already at max prestige
    if (isMaxPrestige()) {
      console.warn("Already at max prestige level");
      useEventManager.getState().notify("InvalidPurchase");
      return;
    }

    // Check if user has enough balance
    const cost = getNextPrestigeCost();
    const { balance } = useBalanceStore.getState();
    if (balance < cost) {
      console.warn(
        `Not enough balance for prestige. Need ${cost}, have ${balance}`,
      );
      useEventManager.getState().notify("InvalidPurchase");
      return;
    }

    const nextPrestige = currentPrestige + 1;
    useEventManager
      .getState()
      .notify("PrestigePurchased", { prestigeLevel: nextPrestige });

    useBalanceStore.getState().resetBalance();
    useGameStore.getState().resetGameStore();
    useL2Store.getState().resetL2Store();
    useTransactionsStore.getState().resetTransactions();
    useTransactionPauseStore.getState().resetPauseStore();
    get().resetUpgrades();

    set({
      currentPrestige: nextPrestige,
      canPrestige: false,
    });

    console.log(`Prestige complete! New prestige level: ${nextPrestige}`);
  },

  // Can unlock if the previous upgrade level is at least 0
  canUnlockUpgrade: (chainId: number, upgradeId: number): boolean => {
    if (upgradeId === 0) return true; // Always can unlock the first transaction
    const { upgrades } = get();
    const upgradeLevels = upgrades[chainId] || {};
    const lastUpgradeLevel = upgradeLevels[upgradeId - 1];
    if (lastUpgradeLevel === undefined) {
      console.warn(
        `Transaction with ID ${upgradeId - 1} not found for chain ${chainId}`,
      );
      return false;
    }
    return lastUpgradeLevel >= 0;
  },

  getUpgradeValue: (chainId: number, upgradeName: string): number => {
    const { upgrades } = get();
    // Get the upgrade info
    const chainUpgrades = upgrades[chainId] || {};
    const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
    const upgrade = upgradeJsonChain.find(
      (upgrade) => upgrade.name === upgradeName,
    );
    if (!upgrade || chainUpgrades[upgrade.id] === undefined) {
      console.warn(`Upgrade not found: ${upgradeName} for chainId: ${chainId}`);
      return 0;
    }

    const level =
      chainUpgrades[upgrade.id] !== undefined ? chainUpgrades[upgrade.id] : -1;
    return level === -1 ? upgrade.baseValue : upgrade.values[level];
  },

  getUpgradeLevel: (chainId: number, upgradeName: string): number => {
    const { upgrades } = get();
    // Get the upgrade info
    const chainUpgrades = upgrades[chainId] || {};
    const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
    const upgrade = upgradeJsonChain.find(
      (upgrade) => upgrade.name === upgradeName,
    );
    if (!upgrade || chainUpgrades[upgrade.id] === undefined) {
      console.warn(`Upgrade not found: ${upgradeName} for chainId: ${chainId}`);
      return 0;
    }

    const level =
      chainUpgrades[upgrade.id] !== undefined ? chainUpgrades[upgrade.id] : -1;
    return level;
  },

  getUpgradeValueAt: (chainId: number, upgradeId: number): number => {
    const { upgrades } = get();
    const chainUpgrades = upgrades[chainId] || {};
    const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
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

  getNextUpgradeCost: (chainId: number, upgradeId: number): number => {
    const { upgrades } = get();
    const chainUpgrades = upgrades[chainId] || {};
    const upgradeJsonChain = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
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

  getAutomationValue: (chainId: number, automationName: string): number => {
    const { automations } = get();
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

  getAutomationSpeedAt: (chainId: number, automationId: number): number => {
    const { automations } = get();
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

  getNextAutomationCost: (chainId: number, automationId: number): number => {
    const { automations } = get();
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

  getNextPrestigeCost: (): number => {
    const { currentPrestige } = get();
    const maxPrestige = prestigeJson.length - 1;

    // If at max prestige, return 0 or max cost
    if (currentPrestige >= maxPrestige) {
      return 0; // No cost since can't prestige further
    }

    const prestigeCost = prestigeJson[currentPrestige + 1]?.cost || 0;
    return prestigeCost;
  },

  isMaxPrestige: (): boolean => {
    const { currentPrestige } = get();
    const maxPrestige = prestigeJson.length - 1;
    return currentPrestige >= maxPrestige;
  },

  getMaxPrestige: (): number => {
    return prestigeJson.length - 1;
  },

  getPrestigeScaler: (): number => {
    const { currentPrestige } = get();
    return prestigeJson[currentPrestige]?.scaler || 1;
  },
}));

// Export hook for easier migration
export const useUpgrades = () => {
  return useUpgradesStore();
};
