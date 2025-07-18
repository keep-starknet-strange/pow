import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useEventManager } from "../context/EventManager";
import { useFocEngine } from "./FocEngineConnector";
import { usePowContractConnector } from "./PowContractConnector";
import { useBalance } from "../stores/useBalanceStore";
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
  canPrestige: boolean;
  prestige: () => void;

  canUnlockUpgrade: (chainId: number, upgradeId: number) => boolean;
  getUpgradeValue: (chainId: number, upgradeName: string) => number;
  getUpgradeValueAt: (chainId: number, upgradeId: number) => number;
  getNextUpgradeCost: (chainId: number, upgradeId: number) => number;
  getAutomationValue: (chainId: number, automationName: string) => number;
  getAutomationSpeedAt: (chainId: number, automationId: number) => number;
  getNextAutomationCost: (chainId: number, automationId: number) => number;
  getNextPrestigeCost: () => number;
};

// curl http://localhost:8080/events/get-unique-with\?contractAddress\=0x3f521e989acabd697addbf1c456d10ae9a4f5ad8bb680cf843da0ad765b4b80\&eventType\=pow_game::upgrades::component::PowUpgradesComponent::UpgradeLevelUpdated\&uniqueKey\=upgrade_id -X POST -d "{\"chain_id\":0}"

export const useUpgrades = () => {
  const context = useContext(UpgradesContext);
  if (!context) {
    throw new Error("useUpgrades must be used within an UpgradesProvider");
  }
  return context;
};
const UpgradesContext = createContext<UpgradesContextType | undefined>(
  undefined,
);

export const UpgradesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, getUniqueEventsWith } = useFocEngine();
  const { powContract, getUserUpgradeLevels, getUserAutomationLevels } =
    usePowContractConnector();

  const [upgrades, setUpgrades] = useState<{
    [chainId: number]: { [upgradeId: number]: number };
  }>({});
  const [automations, setAutomation] = useState<{
    [chainId: number]: { [upgradeId: number]: number };
  }>({});
  const [currentPrestige, setCurrentPrestige] = useState<number>(0);
  const { notify } = useEventManager();
  const { tryBuy } = useBalance();

  const resetUpgrades = () => {
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
    setUpgrades(initUpgrades);
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
    setAutomation(initAutomation);
  };

  useEffect(() => {
    const fetchUpgradeLevels = async () => {
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
        setUpgrades((prevUpgrades) => {
          const newUpgrades = { ...prevUpgrades };
          if (!newUpgrades[chainId]) {
            newUpgrades[chainId] = {};
          }
          userUpgradeLevels.forEach((level: number, upgradeId: number) => {
            newUpgrades[chainId][upgradeId] = level - 1; // Already zero-based index
          });
          return newUpgrades;
        });
      }
    };
    const fetchAutomationLevels = async () => {
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
        setAutomation((prevAutomations) => {
          const newAutomations = { ...prevAutomations };
          if (!newAutomations[chainId]) {
            newAutomations[chainId] = {};
          }
          userAutomationLevels.forEach(
            (level: number, automationId: number) => {
              newAutomations[chainId][automationId] = level - 1; // Already zero-based index
            },
          );
          return newAutomations;
        });
      }
    };

    resetUpgrades();
    fetchUpgradeLevels();
    fetchAutomationLevels();
  }, [user, powContract, getUniqueEventsWith]);

  const upgrade = (chainId: number, upgradeId: number) => {
    setUpgrades((prevUpgrades) => {
      if (!canUnlockUpgrade(chainId, upgradeId)) {
        notify("InvalidPurchase");
        return prevUpgrades;
      }
      const newUpgrades = { ...prevUpgrades };
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
        return newUpgrades;
      }
      const currentLevel = newUpgrades[chainId][upgradeId];
      if (currentLevel >= upgrade.values.length - 1) {
        console.warn(
          `Upgrade already at maximum level: ${upgradeId} for chainId: ${chainId}`,
        );
        return newUpgrades;
      }
      const cost = upgrade.costs[currentLevel + 1];
      if (!tryBuy(cost)) return newUpgrades;
      // Increment upgrade level
      newUpgrades[chainId][upgradeId] = currentLevel + 1;
      notify("UpgradePurchased", {
        chainId,
        upgradeId,
        level: newUpgrades[chainId][upgradeId],
        newUpgrades: newUpgrades,
      });
      return newUpgrades;
    });
  };

  const upgradeAutomation = (chainId: number, automationId: number) => {
    setAutomation((prevAutomations) => {
      const newAutomations = { ...prevAutomations };
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
        return newAutomations;
      }
      const currentLevel = newAutomations[chainId][automationId];
      if (currentLevel >= automation.levels.length - 1) {
        console.warn(
          `Automation already at maximum level: ${automationId} for chainId: ${chainId}`,
        );
        return newAutomations;
      }
      const cost = automation.levels[currentLevel + 1].cost;
      if (!tryBuy(cost)) return newAutomations;
      // Increment automation level
      newAutomations[chainId][automationId] = currentLevel + 1;
      notify("AutomationPurchased", {
        chainId,
        automationId,
        level: newAutomations[chainId][automationId],
      });
      return newAutomations;
    });
  };

  const [canPrestige, setCanPrestige] = useState<boolean>(false);
  // Can prestige if all L2 txs unlocked, all upgrades unlocked, all automations unlocked, and staking unlocked
  useEffect(() => {
    const checkCanPrestige = () => {
      /* TODO: Include once switched to zustand
      if (!stakingUnlocked) {
        setCanPrestige(false);
        return;
      }
      */
      const automationlevels = automations[1];
      if (!automationlevels) {
        setCanPrestige(false);
        return;
      }
      for (const level of Object.values(automationlevels)) {
        if (level < 0) {
          setCanPrestige(false);
          return;
        }
      }
      const upgradeLevels = upgrades[1];
      if (!upgradeLevels) {
        setCanPrestige(false);
        return;
      }
      for (const level of Object.values(upgradeLevels)) {
        if (level < 0) {
          setCanPrestige(false);
          return;
        }
      }
      /* TODO: Include once switched to zustand
      const dappLevels = dappFees[1];
      if (!dappLevels) {
        setCanPrestige(false);
        return;
      }
      const transactionLevels = transactionFees[1];
      if (!transactionLevels) {
        setCanPrestige(false);
        return;
      }
      */
      setCanPrestige(true);
    };
    checkCanPrestige();
  }, [upgrades, automations]);

  const prestige = () => {
    setCurrentPrestige((prevPrestige) => {
      const nextPrestige = prevPrestige + 1;
      notify("PrestigePurchased", { prestigeLevel: nextPrestige });
      resetUpgrades();
      return nextPrestige;
    });
  };

  // Can unlock if the previous upgrade level is at least 0
  const canUnlockUpgrade = useCallback(
    (chainId: number, upgradeId: number): boolean => {
      if (upgradeId === 0) return true; // Always can unlock the first transaction
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
    [upgrades],
  );

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

  return (
    <UpgradesContext.Provider
      value={{
        upgrades,
        automations,
        upgrade,
        upgradeAutomation,
        canUnlockUpgrade,
        getUpgradeValue,
        getUpgradeValueAt,
        getNextUpgradeCost,
        getAutomationValue,
        getAutomationSpeedAt,
        getNextAutomationCost,
        currentPrestige,
        canPrestige,
        prestige,
        getNextPrestigeCost,
      }}
    >
      {children}
    </UpgradesContext.Provider>
  );
};
