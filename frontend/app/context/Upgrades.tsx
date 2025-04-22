import { createContext, useContext, useEffect, useState } from "react";
import { Upgrade } from "../types/Upgrade";
import upgradesJson from "../configs/upgrades.json";
import automationsJson from "../configs/automation.json";
import { useGameState } from "./GameState";
import { useEventManager } from "../context/EventManager";
import { newBaseUpgradableGameState, TransactionTypeState, newEmptyGameState } from "../types/GameState";

type UpgradesContextType = {
  addUpgrade: (chainId: number, upgradeId: number) => void;
  updateUpgrade: (upgrade: Upgrade ) => void;
  removeUpgrade: (upgrade: Upgrade ) => void;
  isUpgradeActive: (id: number) => boolean;
  upgrades: { [chainId: number]: { [upgradeId: number]: Upgrade } };
  automation: { [chainId: number]: { [upgradeId: number]: Upgrade } };
  upgradeAutomation: (chainId: number, upgradeId: number) => void;
  l1TransactionTypes: TransactionTypeState[];
  l1TxSpeedUpgrade: (id: number) => void;
  l1TxFeeUpgrade: (id: number) => void;
  l2TransactionTypes: TransactionTypeState[];
  l2TxSpeedUpgrade: (id: number) => void;
  l2TxFeeUpgrade: (id: number) => void;
  l1DappTypes: TransactionTypeState[];
  l2DappTypes: TransactionTypeState[];
  l1DappFeeUpgrade: (id: number) => void;
  l2DappFeeUpgrade: (id: number) => void;
  l1DappSpeedUpgrade: (id: number) => void;
  l2DappSpeedUpgrade: (id: number) => void;
  doPrestige: () => void;
};

export const useUpgrades = () => {
  const context = useContext(UpgradeContext);
  if (!context) {
    throw new Error("useUpgrades must be used within an UpgradesProvider");
  }
  return context;
}
const UpgradeContext = createContext<UpgradesContextType | undefined>(undefined);

export const UpgradesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [upgrades, setUpgrades] = useState<{ [chainId: number]: { [upgradeId: number]: Upgrade } }>({});
  const [automation, setAutomation] = useState<{ [chainId: number]: { [upgradeId: number]: Upgrade } }>({});
  const [l1TransactionTypes, setL1TransactionTypes] = useState<TransactionTypeState[]>([]);
  const [l2TransactionTypes, setL2TransactionTypes] = useState<TransactionTypeState[]>([]);
  const [l1DappTypes, setL1DappTypes] = useState<TransactionTypeState[]>([]);
  const [l2DappTypes, setL2DappTypes] = useState<TransactionTypeState[]>([]);
  const { notify } = useEventManager();
  // TODO: Move upgradableGameState into this context?
  const { setGameState, upgradableGameState, setUpgradableGameState } = useGameState();

  const resetUpgrades = () => {
    // Initialize upgrades
    const initUpgrades: { [chainId: number]: { [upgradeId: number]: Upgrade } } = {};
    for (const chainId in upgradesJson) {
      const chainIdInt = chainId === "L1" ? 0 : 1;
      const upgradeJsonChain = chainId === "L1" ? upgradesJson.L1 : upgradesJson.L2;
      initUpgrades[chainIdInt] = {};
      for (const upgradeId in upgradeJsonChain) {
        const upgrade = upgradeJsonChain[upgradeId];
        initUpgrades[chainIdInt][upgradeId] = {
          ...upgrade,
          level: 0,
        };
      }
    }
    setUpgrades(initUpgrades);
    const initAutomation: { [chainId: number]: { [upgradeId: number]: Upgrade } } = {};
    for (const chainId in automationsJson) {
      const chainIdInt = chainId === "L1" ? 0 : 1;
      const automationJsonChain = chainId === "L1" ? automationsJson.L1 : automationsJson.L2;
      initAutomation[chainIdInt] = {};
      for (const upgradeId in automationJsonChain) {
        const upgrade = automationJsonChain[upgradeId];
        initAutomation[chainIdInt][upgradeId] = {
          ...upgrade,
          level: 0,
        };
      }
    }
    setAutomation(initAutomation);
    const initL1TransactionTypes = [
      {
        "id": 0,
        "feeLevel": 1,
        "speedLevel": 0
      },
      {
        "id": 1,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 2,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 3,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 4,
        "feeLevel": 0,
        "speedLevel": 0
      }
    ];
    const initL2TransactionTypes = [
      {
        "id": 0,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 1,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 2,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 3,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 4,
        "feeLevel": 0,
        "speedLevel": 0
      }
    ];
    setL1TransactionTypes(initL1TransactionTypes);
    setL2TransactionTypes(initL2TransactionTypes);

    const initL1DappTypes = [
      {
        "id": 0,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 1,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 2,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 3,
        "feeLevel": 0,
        "speedLevel": 0
      }
    ];
    const initL2DappTypes = [
      {
        "id": 0,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 1,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 2,
        "feeLevel": 0,
        "speedLevel": 0
      },
      {
        "id": 3,
        "feeLevel": 0,
        "speedLevel": 0
      }
    ];
    setL1DappTypes(initL1DappTypes);
    setL2DappTypes(initL2DappTypes);
  };

  useEffect(() => {
    resetUpgrades();
  }, []);
    


  const addUpgrade = (chainId: number, upgradeId: number) => {
    let upgrade = null;
    if (chainId === 0) {
      upgrade = upgradesJson.L1[upgradeId];
    } else {
      upgrade = upgradesJson.L2[upgradeId];
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
    setUpgrades((prevUpgrades) => {
      const { [upgrade.id]: _, ...rest } = prevUpgrades;
      return rest;
    });
  };

  const isUpgradeActive = (id: number ) :boolean => {
    return upgrades[id] !== undefined;
  };

  const l1TxSpeedUpgrade = (id: number) => {
    const currentLevel = l1TransactionTypes[id].speedLevel || 0;
    const newTransactionTypes = { ...l1TransactionTypes };
    newTransactionTypes[id] = {
      ...l1TransactionTypes[id],
      speedLevel: currentLevel + 1
    };
    setL1TransactionTypes(newTransactionTypes);
  }

  const l1TxFeeUpgrade = (id: number) => {
    const currentLevel = l1TransactionTypes[id].feeLevel || 0;
    const newTransactionTypes = { ...l1TransactionTypes };
    newTransactionTypes[id] = {
      ...l1TransactionTypes[id],
      feeLevel: currentLevel + 1
    };
    setL1TransactionTypes(newTransactionTypes);
  }

  const l2TxSpeedUpgrade = (id: number) => {
    const currentLevel = l2TransactionTypes[id].speedLevel || 0;
    const newTransactionTypes = { ...l2TransactionTypes };
    newTransactionTypes[id] = {
      ...l2TransactionTypes[id],
      speedLevel: currentLevel + 1
    };
    setL2TransactionTypes(newTransactionTypes);
  }

  const l2TxFeeUpgrade = (id: number) => {
    const currentLevel = l2TransactionTypes[id].feeLevel || 0;
    const newTransactionTypes = { ...l2TransactionTypes };
    newTransactionTypes[id] = {
      ...l2TransactionTypes[id],
      feeLevel: currentLevel + 1
    };
    setL2TransactionTypes(newTransactionTypes);
  }

  const l1DappFeeUpgrade = (id: number) => {
    const currentLevel = l1DappTypes[id].feeLevel || 0;
    const newTransactionTypes = { ...l1DappTypes };
    newTransactionTypes[id] = {
      ...l1DappTypes[id],
      feeLevel: currentLevel + 1
    };
    setL1DappTypes(newTransactionTypes);
  }

  const l2DappFeeUpgrade = (id: number) => {
    const currentLevel = l2DappTypes[id].feeLevel || 0;
    const newTransactionTypes = { ...l2DappTypes };
    newTransactionTypes[id] = {
      ...l2DappTypes[id],
      feeLevel: currentLevel + 1
    };
    setL2DappTypes(newTransactionTypes);
  }

  const l1DappSpeedUpgrade = (id: number) => {
    const currentLevel = l1DappTypes[id].speedLevel || 0;
    const newTransactionTypes = { ...l1DappTypes };
    newTransactionTypes[id] = {
      ...l1DappTypes[id],
      speedLevel: currentLevel + 1
    };
    setL1DappTypes(newTransactionTypes);
  }

  const l2DappSpeedUpgrade = (id: number) => {
    const currentLevel = l2DappTypes[id].speedLevel || 0;
    const newTransactionTypes = { ...l2DappTypes };
    newTransactionTypes[id] = {
      ...l2DappTypes[id],
      speedLevel: currentLevel + 1
    };
    setL2DappTypes(newTransactionTypes);
  }

  const upgradeAutomation = (chainId: number, upgradeId: number) => {
    let upgrade = null;
    if (chainId === 0) {
      upgrade = automationsJson.L1[upgradeId];
    } else {
      upgrade = automationsJson.L2[upgradeId];
    }
    const currentLevel = automation[chainId][upgrade.id]?.level || 0;
    const newUpgrade = {
      ...upgrade,
      level: Math.min(currentLevel + 1, upgrade.levels.length)
    };
    switch (upgrade.name) {
      case "Miner":
        setUpgradableGameState((prev) => ({
          ...prev,
          minerSpeed: prev.minerSpeed + 1
        }));
        break;
      case "Sequencer":
        setUpgradableGameState((prev) => ({
          ...prev,
          sequencerSpeed: prev.sequencerSpeed + 1
        }));
        break;
      case "Prover":
        setUpgradableGameState((prev) => ({
          ...prev,
          proverSpeed: prev.proverSpeed + 1
        }));
        break;
      case "DA":
        setUpgradableGameState((prev) => ({
          ...prev,
          daSpeed: prev.daSpeed + 1
        }));
        break;
      default:
        console.warn(`Unknown upgrade: ${upgrade.name}`);
        break;
    }

    const updatedAutomation = { ...automation, [chainId]: { ...automation[chainId], [upgrade.id]: newUpgrade } };
    setAutomation(updatedAutomation);
    notify("AutomationPurchased", { upgrade: newUpgrade, allAutomation: updatedAutomation });
  };

  const doPrestige = () => {
    const newPrestige = upgradableGameState.prestige + 1;
    setGameState(newEmptyGameState());
    const newUpgradableGameState = newBaseUpgradableGameState();
    newUpgradableGameState.prestige = newPrestige;
    setUpgradableGameState(newUpgradableGameState);
    resetUpgrades();
  }

  return (
    <UpgradeContext.Provider value={{ addUpgrade, updateUpgrade, upgrades, removeUpgrade, isUpgradeActive,
      automation, upgradeAutomation,
      l1TransactionTypes, l1TxSpeedUpgrade, l1TxFeeUpgrade, l2TransactionTypes, l2TxSpeedUpgrade, l2TxFeeUpgrade,
      l1DappTypes, l2DappTypes, l1DappFeeUpgrade, l2DappFeeUpgrade, l1DappSpeedUpgrade, l2DappSpeedUpgrade, doPrestige }}>
      {children}
    </UpgradeContext.Provider>
  );
};
