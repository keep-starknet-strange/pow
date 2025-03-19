import { createContext, useContext, useEffect, useState } from "react";
import { Upgrade } from "../types/Upgrade";

type UpgradesContextType = {
  addUpgrade: (upgrade: Upgrade ) => void;
  updateUpgrade: (upgrade: Upgrade ) => void;
  removeUpgrade: (upgrade: Upgrade ) => void;
  isUpgradeActive: (id: number
  ) => boolean;
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

  useEffect(() => {
    // TODO: Fetch upgrades from server
  }, []);


  const addUpgrade = (upgrade: Upgrade) => {
    setUpgrades((prevUpgrades) => ({
      ...prevUpgrades,
      [upgrade.id]: upgrade,
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
