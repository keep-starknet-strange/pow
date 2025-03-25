import { createContext, useContext, useEffect, useState } from "react";
import { Upgrade } from "../types/Upgrade";
import { useGameState } from "./GameState";

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

  // TODO: Move upgradableGameState into this context?
  const { upgradableGameState, setUpgradableGameState } = useGameState();

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
          difficulty: upgradableGameState.difficulty - 1
        }));
        break;
      case "Block Size":
        setUpgradableGameState((prev) => ({
          ...prev,
          blockSize: upgradableGameState.blockSize + 1
        }));
        break;
      case "Block Reward":
        setUpgradableGameState((prev) => ({
          ...prev,
          blockReward: upgradableGameState.blockReward * 2
        }));
        break;
      case "MEV Boost":
        setUpgradableGameState((prev) => ({
          ...prev,
          mevBoost: upgradableGameState.mevScaling + 1
        }));
        break;
      case "Sequencer":
        setUpgradableGameState((prev) => ({
          ...prev,
          sequencerSpeed: upgradableGameState.sequencerSpeed + 1
        }));
        break;
      case "Miner":
        setUpgradableGameState((prev) => ({
          ...prev,
          minerSpeed: upgradableGameState.minerSpeed + 1
        }));
        break;
      case "Unlock L2s":
        // TODO?
        break;
      case "Unlock L2 Blobs":
        // TODO?
        break;
      case "Dapps":
        // TODO?
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
    setUpgrades((prevUpgrades) => ({
      ...prevUpgrades,
      [upgrade.id]: newUpgrade
    }));
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
