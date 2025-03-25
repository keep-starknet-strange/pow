import inscriptionImages from "../configs/inscriptions.json";
import dappConfigs from "../configs/dapps.json";
import { getRandomAddress, getRandomFromArray } from "../utils/transactions";
import transactionTypesConfig from "../configs/transactions.json";


export type Transaction = {
  meta1: string;
  meta2: string;
  type: string;
  amount: number;
  fee: number;
  style: { backgroundColor: string };
  image?: string;
};

export type TransactionType = keyof typeof transactionTypesConfig;

const getRandomTransactionType = (isUpgradeActive: (id: number
) => boolean) => {
  const availableTypes = Object.entries(transactionTypesConfig)
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

// TODO: Download images and add them to the project then move to config file
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
    default:
      return "https://www.freeiconspng.com/thumbs/question-mark-icon/black-question-mark-icon-clip-art-10.png";
  }
};

type TransactionMetaBuilder = {
  meta1: () => string;
  meta2: () => string;
};

// TDOO: better name than meta?
const metaBuilder: Record<TransactionType, () => { meta1: string; meta2: string }> = {
  Transfer: () => ({
    meta1: getRandomAddress(),
    meta2: getRandomAddress(),
  }),
  Inscription: () => ({
    meta1: "Inscription",
    meta2: `tx:${getRandomAddress()}`,
  }),
  "L2 Transaction Batch": () => ({
    meta1: "L2 Batch",
    meta2: `${Math.floor(Math.random() * 100)} txs`,
  }),
  "L2 Blob": () => ({
    meta1: `${(Math.random() * 100).toFixed(2)}kb blob`,
    meta2: `origin:${getRandomAddress()}`,
  }),
  Dapp: () => ({
    meta1: getRandomFromArray(dappConfigs.names),
    meta2: getRandomFromArray(dappConfigs.actions),
  }),
};

export const newTransaction = (isUpgradeActive: (id: number) => boolean, mevScaling: number): Transaction => {
  const type = getRandomTransactionType(isUpgradeActive) as TransactionType;
  const config = transactionTypesConfig[type];
  const { meta1, meta2 } = metaBuilder[type]();

  return {
    meta1,
    meta2,
    type,
    amount: (Math.random() + 1) * 10,
    fee: (Math.random() + 1 + config.feeBump) * 0.1 * mevScaling,
    style: { backgroundColor: config.color },
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
    style: { backgroundColor: "#f7f7f7" },
    image: "https://www.freeiconspng.com/thumbs/question-mark-icon/black-question-mark-icon-clip-art-10.png"
  };
}
