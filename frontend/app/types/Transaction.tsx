import { ActivatedUpgrades, Upgrades } from "./Upgrade";

export type Transaction = {
  from: string;
  to: string;
  type: string;
  amount: number;
  fee: number;
  style?: { backgroundColor: string };
};

export type TransactionType = "Transfer" | "L2 Transaction Batch" | "L2 Blob";

const TRANSACTION_TYPES: Record<TransactionType, { color: string; chance: number; feeBump: number; requiredUpgrade: string | null }> = {
  "Transfer": { color: "#f7f7f7", chance: 0.75, feeBump: 0, requiredUpgrade: null }, // Always available
  "L2 Transaction Batch": { color: "#6B46C1", feeBump: 1, chance: 0.25, requiredUpgrade: "l2Upgrade" },
  "L2 Blob": { color: "#4A90E2", chance: 0.15, feeBump: 2, requiredUpgrade: "l2BlobUpgrade" },
};

// Function to determine a valid transaction type based on active upgrades
type Upgrade = {
  purchased: boolean;
};

const getRandomTransactionType = (activatedUpgrades: ActivatedUpgrades) => {
  const availableTypes = Object.entries(TRANSACTION_TYPES)
    .filter(([_, { requiredUpgrade }]) => !requiredUpgrade || activatedUpgrades[requiredUpgrade]) // Only include if upgrade is active
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

export const newTransaction = (activatedUpgrades: ActivatedUpgrades): Transaction => {
  const type = getRandomTransactionType(activatedUpgrades) as TransactionType;

  return {
    from: Math.random().toString(36).substring(2, 15),
    to: Math.random().toString(36).substring(2, 15),
    type,
    amount: (Math.random() + 1) * 10,
    fee: (Math.random() + 1 + TRANSACTION_TYPES[type as TransactionType].feeBump) * 0.1,
    style: { backgroundColor: TRANSACTION_TYPES[type as TransactionType].color },
  };
};

export const newEmptyTransaction = () => {
  return {
    from: "",
    to: "",
    type: "",
    amount: 0,
    fee: 0
  };
}

export const getTransactionStyle = (type: string) => {
  switch (type) {
    case "L2 Transaction Batch":
      return { backgroundColor: "#4A90E2" }; // Blue (Example)
      case "L2 Blob":
      return { backgroundColor: "#6B46C1" }; // Purple
    default:
      return { backgroundColor: "#f7f7f7" }; // Default Grey
  }
};

