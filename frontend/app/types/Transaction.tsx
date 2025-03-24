import inscriptionImages from "../configs/inscriptions.json";
import dappConfigs from "../configs/dapps.json";
import { getRandomAddress, getRandomFromArray } from "../utils/transactions";

export type Transaction = {
  meta1: string;
  meta2: string;
  type: string;
  amount: number;
  fee: number;
  style: { backgroundColor: string };
  image?: string;
};

export type TransactionType = "Transfer" | "L2 Transaction Batch" | "L2 Blob" | "Inscription" | "Dapp";

const TRANSACTION_TYPES: Record<TransactionType, { 
  color: string;
  chance: number;
  feeBump: number;
  requiredUpgrade: number | null,
  levelMultiplier: number; 
}> = {
  "Transfer":             { color: "#60f760a0", chance: 0.65, feeBump: 0, requiredUpgrade: null, levelMultiplier: 1 }, // Always available
  "L2 Transaction Batch": { color: "#f7f760a0", chance: 0.25, feeBump: 1, requiredUpgrade: 2,    levelMultiplier: 1 },
  "L2 Blob":              { color: "#6060f7a0", chance: 0.15, feeBump: 2, requiredUpgrade: 3,    levelMultiplier: 1 },
  "Inscription":          { color: "#f760f7a0", chance: 0.2,  feeBump: 3, requiredUpgrade: 9,    levelMultiplier: 1 },
  "Dapp":                 { color: "#f76060a0", chance: 0.1,  feeBump: 4, requiredUpgrade: 10,   levelMultiplier: 1 },
};

// Function to determine a valid transaction type based on active upgrades
type Upgrade = {
  purchased: boolean;
};

const getRandomTransactionType = (isUpgradeActive: (id: number
) => boolean) => {
  const availableTypes = Object.entries(TRANSACTION_TYPES)
    .filter(([_, { requiredUpgrade }]) => !requiredUpgrade || isUpgradeActive(requiredUpgrade)) // Only include if upgrade is active
    .map(([type, { chance }]) => ({ type, chance }));

    // Normalizes probabilities to sum to 100%
    // TODO rework probabilities here
    const totalChance = availableTypes.reduce((sum, { chance }) => sum + chance, 0);
    let cumulativeChance = 0;
    const rand = Math.random() * totalChance; // Scale to total probability

    for (const { type, chance } of availableTypes) {
      cumulativeChance += chance;
      if (rand < cumulativeChance) return type as TransactionType;
    }

    return "Transfer"; // Default fallback
    
};

const getTransactionImage = (type: TransactionType): string | undefined => {
  switch (type) {
    case "Inscription":
      return inscriptionImages[Math.floor(Math.random() * inscriptionImages.length)];
    case "Transfer":
      return "https://cdn-icons-png.flaticon.com/512/876/876784.png";
    case "L2 Transaction Batch":
      return "https://pbs.twimg.com/profile_images/1656626983617323010/xzIYc6hK_400x400.png";
    case "L2 Blob":
      return "https://static.coinpaprika.com/coin/blobs-blobs/logo.png?rev=11132781";
    case "Dapp":
      return "https://static.thenounproject.com/png/2644901-200.png";
  }
};

const getMeta1 = (type: TransactionType): string => {
  switch (type) {
    case "Inscription":
      return "Inscription";
    case "Transfer":
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    case "L2 Transaction Batch":
      return "L2 Batch";
    case "L2 Blob":
      return `BlobSize:${Math.random() * 100}kb`;
    case "Dapp":
      return dappConfigs.names[Math.floor(Math.random() * dappConfigs.names.length)];
  }
}

const getMeta2 = (type: TransactionType): string => {
  switch (type) {
    case "Transfer":
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    case "Inscription":
      return  `tx:${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;;
    case "L2 Transaction Batch":
      return Math.random() * 100 + " txs";
    case "L2 Blob":
      return `origin:${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
    case "Dapp":
      return dappConfigs.actions[Math.floor(Math.random() * dappConfigs.actions.length)];
  }
}

type TransactionMetaBuilder = {
  meta1: () => string;
  meta2: () => string;
};

const META_BUILDERS: Record<TransactionType, TransactionMetaBuilder> = {
  Transfer: {
    meta1: () => getRandomAddress(),
    meta2: () => getRandomAddress(),
  },
  Inscription: {
    meta1: () => "Inscription",
    meta2: () => `tx:${getRandomAddress()}`,
  },
  "L2 Transaction Batch": {
    meta1: () => "L2 Batch",
    meta2: () => `${Math.floor(Math.random() * 100)} txs`,
  },
  "L2 Blob": {
    meta1: () => `${(Math.random() * 100).toFixed(2)}kb blob`,
    meta2: () => `origin:${getRandomAddress()}`,
  },
  Dapp: {
    meta1: () => getRandomFromArray(dappConfigs.names),
    meta2: () => getRandomFromArray(dappConfigs.actions),
  },
};

export const newTransaction = (isUpgradeActive: (id: number) => boolean, mevScaling: number): Transaction => {
  const type = getRandomTransactionType(isUpgradeActive) as TransactionType;

  return {
    meta1: META_BUILDERS[type].meta1(),
    meta2: META_BUILDERS[type].meta2(),
    type,
    amount: (Math.random() + 1) * 10,
    fee: (Math.random() + 1 + TRANSACTION_TYPES[type as TransactionType].feeBump) * 0.1 * mevScaling,
    style: { backgroundColor: TRANSACTION_TYPES[type as TransactionType].color },
    image: getTransactionImage(type)
  };
};

export const newEmptyTransaction = () => {
  return {
    meta1: "",
    meta2: "",
    type: "",
    amount: 0,
    fee: 0,
    style: { backgroundColor: "#f7f7f7" }
  };
}
