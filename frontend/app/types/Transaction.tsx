import { Upgrades } from "./Upgrade";
import inscriptionImages from "../configs/inscriptions.json";

export type Transaction = {
  from: string;
  to: string;
  type: string;
  amount: number;
  fee: number;
  style: { backgroundColor: string };
  image?: string;
};

export type TransactionType = "Transfer" | "L2 Transaction Batch" | "L2 Blob" | "Inscription";

const TRANSACTION_TYPES: Record<TransactionType, { color: string; chance: number; feeBump: number; requiredUpgrade: number | null }> = {
  "Transfer": { color: "#60f760a0", chance: 0.65, feeBump: 0, requiredUpgrade: null }, // Always available
  "L2 Transaction Batch": { color: "#f7f760a0", feeBump: 1, chance: 0.25, requiredUpgrade: 2 },
  "L2 Blob": { color: "#6060f7a0", chance: 0.15, feeBump: 2, requiredUpgrade: 3 },
  "Inscription": { color: "#f760f7a0", chance: 0.2, feeBump: 3, requiredUpgrade: 9 },
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

const getTransactionImage = (type: string) => {
  if (type === "Inscription") {
    return inscriptionImages[Math.floor(Math.random() * inscriptionImages.length)];
  } else if (type === "Transfer") {
    return "https://cdn-icons-png.flaticon.com/512/876/876784.png";
  } else if (type === "L2 Transaction Batch") {
    return "https://pbs.twimg.com/profile_images/1656626983617323010/xzIYc6hK_400x400.png";
  } else if (type === "L2 Blob") {
    return "https://static.coinpaprika.com/coin/blobs-blobs/logo.png?rev=11132781";
  }
  return undefined;
}

export const newTransaction = (isUpgradeActive: (id: number) => boolean, mevScaling: number): Transaction => {
  const type = getRandomTransactionType(isUpgradeActive) as TransactionType;

  return {
    from: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    to: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    type,
    amount: (Math.random() + 1) * 10,
    fee: (Math.random() + 1 + TRANSACTION_TYPES[type as TransactionType].feeBump) * 0.1 * mevScaling,
    style: { backgroundColor: TRANSACTION_TYPES[type as TransactionType].color },
    image: getTransactionImage(type)
  };
};

export const newEmptyTransaction = () => {
  return {
    from: "",
    to: "",
    type: "",
    amount: 0,
    fee: 0,
    style: { backgroundColor: "#f7f7f7" }
  };
}
