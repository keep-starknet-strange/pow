import React from "react";
import { View } from "react-native";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { getTxIconName, getShopIconBackground } from "../../utils/transactions";
import { IconWithLock } from "./transactionUpgrade/IconWithLock";
import { TxDetails } from "./transactionUpgrade/TxDetails";
import { TransactionUpgradeActions } from "./transactionUpgrade/TransactionUpgradeActions";

export type TransactionUpgradeViewProps = {
  chainId: number;
  txData: any; // TODO: define a proper type for txData
  isDapp?: boolean;
};

export const TransactionUpgradeView: React.FC<TransactionUpgradeViewProps> =
  React.memo((props) => {
    const {
      getFeeLevel,
      getSpeedLevel,
      getNextFeeCost,
      getNextSpeedCost,
      txFeeUpgrade,
      txSpeedUpgrade,
      dappFeeUpgrade,
      dappSpeedUpgrade,
    } = useTransactionsStore();

    const txFeeLevel = getFeeLevel(
      props.chainId,
      props.txData.id,
      props.isDapp,
    );
    const txSpeedLevel = getSpeedLevel(
      props.chainId,
      props.txData.id,
      props.isDapp,
    );
    const nextTxFeeCost = getNextFeeCost(
      props.chainId,
      props.txData.id,
      props.isDapp,
    );
    const nextTxSpeedCost = getNextSpeedCost(
      props.chainId,
      props.txData.id,
      props.isDapp,
    );
    return (
      <View className="flex flex-col w-full">
        <View className="flex flex-row w-full mb-[4px]">
          <IconWithLock
            txIcon={getTxIconName(
              props.chainId,
              props.txData.id,
              props.isDapp || false,
            )}
            locked={txFeeLevel === -1}
            backgroundColor={getShopIconBackground(
              props.chainId,
              props.txData.id,
              props.isDapp || false,
            )}
          />
          <TxDetails
            name={props.txData.name}
            description={props.txData.description}
          />
        </View>
        <TransactionUpgradeActions
          locked={txFeeLevel === -1}
          nextCost={nextTxFeeCost}
          txId={props.txData.id}
          chainId={props.chainId}
          isDapp={props.isDapp}
          onBuyPress={() => {
            if (props.isDapp) {
              dappFeeUpgrade(props.chainId, props.txData.id);
            } else {
              txFeeUpgrade(props.chainId, props.txData.id);
            }
          }}
          feeProps={{
            level: txFeeLevel + 1, // Pass next level to purchase (current + 1)
            maxLevel: props.txData.feeCosts.length,
            nextCost: nextTxFeeCost,
            onPress: () => {
              if (props.isDapp) {
                dappFeeUpgrade(props.chainId, props.txData.id);
              } else {
                txFeeUpgrade(props.chainId, props.txData.id);
              }
            },
            color: props.txData.color.substring(0, 7) + "f0",
          }}
          speedProps={{
            level: txSpeedLevel + 1, // Pass next level to purchase (current + 1)
            maxLevel: props.txData.speedCosts.length,
            nextCost: nextTxSpeedCost,
            onPress: () => {
              if (props.isDapp) {
                dappSpeedUpgrade(props.chainId, props.txData.id);
              } else {
                txSpeedUpgrade(props.chainId, props.txData.id);
              }
            },
            color: props.txData.color.substring(0, 7) + "f0",
          }}
        />
      </View>
    );
  });
