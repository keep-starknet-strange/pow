import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Upgrade } from "../types/Upgrade";
import { useGameState } from "./GameState";
import { useEventManager } from "../context/EventManager";


type UpgradesContextType = {
  addUpgrade: (upgrade: Upgrade ) => void;
  updateUpgrade: (upgrade: Upgrade ) => void;
  removeUpgrade: (upgrade: Upgrade ) => void;
  isUpgradeActive: (id: number) => boolean;
  upgrades: { [key: number]: Upgrade };
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
  const [upgrades, setUpgrades] = useState<{ [key: number]: Upgrade }>({});
  const { notify } = useEventManager();
  // TODO: Move upgradableGameState into this context?
  const { setUpgradableGameState } = useGameState();

  useEffect(() => {
    // TODO: Fetch upgrades from server
  }, []);


  const addUpgrade = (upgrade: Upgrade) => {
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
    const currentLevel = upgrades[upgrade.id]?.level || 0;
    const newUpgrade = {
      ...upgrade,
      level: upgrade.maxLevel ? Math.min(currentLevel + 1, upgrade.maxLevel) : undefined
    };

    const updatedUpgrades = { ...upgrades, [upgrade.id]: newUpgrade };
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

  return (
    <UpgradeContext.Provider value={{ addUpgrade, updateUpgrade, upgrades, removeUpgrade, isUpgradeActive }}>
      {children}
    </UpgradeContext.Provider>
  );
};
