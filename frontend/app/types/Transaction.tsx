import { ImageSourcePropType } from "react-native";
import dappConfigs from "../configs/dapps.json";
import { getRandomAddress, getRandomFromArray } from "../utils/transactions";
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
