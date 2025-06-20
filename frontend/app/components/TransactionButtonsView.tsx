import React, { useState, useEffect } from "react";
import { View } from "react-native";
import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";
import { TxButton } from "./buttons/TxButton";

export type TransactionButtonsViewProps = {
  chainId: number;
  isDapps?: boolean;
}

export const TransactionButtonsView: React.FC<TransactionButtonsViewProps> = (props) => {
  const [transactionTypes, setTransactionTypes] = useState<any[]>([]);

  useEffect(() => {
    if (props.isDapps) {
      const dappTransactions = props.chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
      setTransactionTypes(dappTransactions);
    } else {
      const chainTransactions = props.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
      setTransactionTypes(chainTransactions);
    }
  }, [props.chainId, props.isDapps]);

  return (
    <View className="flex flex-row w-full items-center justify-around">
      {transactionTypes.map((txType, index) => (
        <View
          className="flex flex-col items-center justify-center relative"
          key={index}
        >
          <TxButton chainId={props.chainId} txType={txType} isDapp={props.isDapps} />
        </View>
      ))}
    </View>
  );
}
