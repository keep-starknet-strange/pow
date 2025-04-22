export type Upgrade = {
  id: number;
  name: string;
  level: number;
};

export type Upgrades = Record<number, Upgrade>;
