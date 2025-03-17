export type Upgrade = {
  cost: number;
  effect: string;
  purchased: boolean;
};

export type Upgrades = Record<string, Upgrade>;
