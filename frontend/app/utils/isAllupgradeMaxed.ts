import { Upgrade } from "../types/Upgrade";

export const isAllUpgradesMaxed = (
  upgradesConfig: Upgrade[],
  currentUpgrades: { [key: number]: Upgrade }
): boolean => {
  return upgradesConfig.every((upgradeCfg: Upgrade) => {
    const currentUpgrade = currentUpgrades[upgradeCfg.id];
    if (upgradeCfg.maxLevel) {
      return currentUpgrade && currentUpgrade.level === upgradeCfg.maxLevel;
    } else {
      return currentUpgrade !== undefined;
    }
  });
};
