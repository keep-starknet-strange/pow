import { ImageSourcePropType } from "react-native";
import dappConfigs from "../configs/dapps.json";
import { getRandomAddress, getRandomFromArray, getRandomTransactionType } from "../utils/transactions";
import transactionTypesConfig from "../configs/transactions.json";
import { inscriptionImages } from "../configs/inscriptions";


export type Transaction = {
  meta1: string;
  meta2: string;
  type: string;
  amount: number;
  fee: number;
  style: 
    { backgroundColor: string };
  image?: ImageSourcePropType;
};

export type TransactionType = keyof typeof transactionTypesConfig;


const transactionBuilder: Record<TransactionType, () => { meta1: string; meta2: string; image: ImageSourcePropType }> = {
  Transfer: () => ({
    meta1: getRandomAddress(),
    meta2: getRandomAddress(),
    image: require("../../assets/images/transaction/transfer.png")
  }),
  "L2 Transactions": () => ({
    meta1: "Batch",
    meta2: `${Math.floor(Math.random() * 100)} txs`,
    image: require("../../assets/images/transaction/l2Batch.png"),
  }),
  "L2 Blob": () => ({
    meta1: `${(Math.random() * 100).toFixed(2)}kb blob`,
    meta2: `origin:${getRandomAddress()}`,
    image: require("../../assets/images/transaction/l2Blob.png"),
  }),
  Inscription: () => ({
    meta1: "Inscription",
    meta2: `tx:${getRandomAddress()}`,
    // get random image(0-11) from the inscription folder
    image: getRandomFromArray(inscriptionImages),
  }),
  Dapp: () => ({
    meta1: getRandomFromArray(dappConfigs.names),
    meta2: getRandomFromArray(dappConfigs.actions),
    image: require("../../assets/images/transaction/dapp.png")
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
    image
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
    image: require("../../assets/images/questionMark.png")
  };
}
