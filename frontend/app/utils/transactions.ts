import { ImageSourcePropType } from "react-native";
import dappConfigs from "../configs/dapps.json";
import transactionTypesConfig from "../configs/transactions.json";
import * as inscriptionImages from "../configs/inscriptions";
import transferImage from "../../assets/images/transaction/transfer.png";
import l2BatchImage from "../../assets/images/transaction/l2Batch.png";
import l2BlobImage from "../../assets/images/transaction/l2Blob.png";
import dappImage from "../../assets/images/transaction/dapp.png";
import questionMarkImage from "../../assets/images/questionMark.png";
import { Transaction, TransactionType } from "../types/Transaction";

export const getRandomAddress = () =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const getRandomFromArray = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const getRandomTransactionType = (isUpgradeActive: (id: number) => boolean) => {
  const availableTypes = Object.entries(transactionTypesConfig)
    .filter(([_, { requiredUpgrade }]) => !requiredUpgrade || isUpgradeActive(requiredUpgrade))
    .map(([type, { chance }]) => ({ type, chance }));

  const totalChance = availableTypes.reduce((sum, { chance }) => sum + chance, 0);
  let cumulativeChance = 0;
  const rand = Math.random() * totalChance;

  for (const { type, chance } of availableTypes) {
    cumulativeChance += chance;
    if (rand < cumulativeChance) return type as TransactionType;
  }

  return "Transfer";
};

const inscriptionImageArray = Object.values(inscriptionImages);

const transactionBuilder: Record<TransactionType, () => { meta1: string; meta2: string; image: ImageSourcePropType }> = {
  Transfer: () => ({
    meta1: getRandomAddress(),
    meta2: getRandomAddress(),
    image: transferImage,
  }),
  "L2 Transactions": () => ({
    meta1: "Batch",
    meta2: `${Math.floor(Math.random() * 100)} txs`,
    image: l2BatchImage,
  }),
  "L2 Blob": () => ({
    meta1: `${(Math.random() * 100).toFixed(2)}kb blob`,
    meta2: `origin:${getRandomAddress()}`,
    image: l2BlobImage,
  }),
  Inscription: () => ({
    meta1: "Inscription",
    meta2: `tx:${getRandomAddress()}`,
    image: getRandomFromArray(inscriptionImageArray),
  }),
  Dapp: () => ({
    meta1: getRandomFromArray(dappConfigs.names),
    meta2: getRandomFromArray(dappConfigs.actions),
    image: dappImage,
  }),
};

export const newTransaction = (isUpgradeActive: (id: number) => boolean, mevScaling: number): Transaction => {
  const type = getRandomTransactionType(isUpgradeActive) as TransactionType;
  const config = transactionTypesConfig[type];
  const { meta1, meta2, image } = transactionBuilder[type]();

  return {
    meta1,
    meta2,
    type,
    amount: (Math.random() + 1) * 10,
    fee: (Math.random() + 1 + config.feeBump) * 0.1 * mevScaling,
    style: { backgroundColor: config.color },
    image,
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
    image: questionMarkImage,
  };
};
