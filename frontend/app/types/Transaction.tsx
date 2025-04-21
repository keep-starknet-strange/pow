import { ImageSourcePropType } from "react-native";
import transactionTypesConfig from "../configs/transactions.json";

export type Transaction = {
  type: string;
  fee: number;
  style: 
    { backgroundColor: string };
  image?: ImageSourcePropType;
};

export type TransactionType = keyof typeof transactionTypesConfig;
