import { useEffect } from "react";
import { useUpgradesStore } from "../stores/useUpgradesStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";

export const UpgradesStoreInitializer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, getUniqueEventsWith } = useFocEngine();
  const { powContract, getUserUpgradeLevels, getUserAutomationLevels } =
    usePowContractConnector();
  const initializeUpgrades = useUpgradesStore(
    (state) => state.initializeUpgrades,
  );

  useEffect(() => {
    initializeUpgrades(
      user,
      powContract,
      getUserUpgradeLevels,
      getUserAutomationLevels,
      getUniqueEventsWith,
    );
  }, [
    user,
    powContract,
    getUserUpgradeLevels,
    getUserAutomationLevels,
    getUniqueEventsWith,
    initializeUpgrades,
  ]);

  return <>{children}</>;
};
