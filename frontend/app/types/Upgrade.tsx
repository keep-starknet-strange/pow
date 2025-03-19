export type Upgrade = {
  cost: number;
  effect: string;
  purchased: boolean;
};

export type UpgradeName = string;

export type Upgrades = Record<UpgradeName, Upgrade>;

export type ActivatedUpgrades = Record<UpgradeName, boolean>;

export const getActiveUpgrades = (upgrades: Upgrades): ActivatedUpgrades => {
  return Object.entries(upgrades).reduce((acc: ActivatedUpgrades, [key, upgrade]: [string, Upgrade]) => {
    acc[key] = upgrade.purchased;
    return acc;
  }, {});
};
