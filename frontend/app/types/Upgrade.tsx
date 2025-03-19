export type Upgrade = {
  id: number;
  name: string;
  cost: number;
  effect: string;
  level?: number;
  maxLevel?: number;
};

export type Upgrades = Record<number, Upgrade>;
