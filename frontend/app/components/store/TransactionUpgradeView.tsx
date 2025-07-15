import React, { useEffect, useState } from "react";
import { View } from "react-native";
import moneyImg from "../../../assets/images/money.png";
import overclockImg from "../../../assets/images/overclock.png";
import { useTransactions } from "../../context/Transactions";
import { getTxIcon } from "../../utils/transactions";
import { IconWithLock } from "./transactionUpgrade/IconWithLock";
import { TxDetails } from "./transactionUpgrade/TxDetails";
import { TransactionUpgradeActions } from "./transactionUpgrade/TransactionUpgradeActions";

export type TransactionUpgradeViewProps = {
  chainId: number;
  txData: any; // TODO: define a proper type for txData
  isDapp?: boolean;
};

export const TransactionUpgradeView: React.FC<TransactionUpgradeViewProps> = (
  props,
) => {
  const {
    transactionFees,
    transactionSpeeds,
    dappFees,
    dappSpeeds,
    getNextTxFeeCost,
    getNextTxSpeedCost,
    getNextDappFeeCost,
    getNextDappSpeedCost,
    txFeeUpgrade,
    txSpeedUpgrade,
    dappFeeUpgrade,
    dappSpeedUpgrade,
  } = useTransactions();

  const [txIcon, setTxIcon] = useState<any>(null);
  useEffect(() => {
    setTxIcon(getTxIcon(props.chainId, props.txData.id, props.isDapp));
  }, [props.chainId, props.txData.id, props.isDapp]);

  const [txFeeLevel, setTxFeeLevel] = useState<number>(0);
  const [txSpeedLevel, setTxSpeedLevel] = useState<number>(0);
  const [nextTxFeeCost, setNextTxFeeCost] = useState<number>(0);
  const [nextTxSpeedCost, setNextTxSpeedCost] = useState<number>(0);
  useEffect(() => {
    if (props.isDapp) {
      setTxFeeLevel(dappFees[props.chainId][props.txData.id]);
      setTxSpeedLevel(dappSpeeds[props.chainId][props.txData.id]);
      setNextTxFeeCost(getNextDappFeeCost(props.chainId, props.txData.id));
      setNextTxSpeedCost(getNextDappSpeedCost(props.chainId, props.txData.id));
    } else {
      setTxFeeLevel(transactionFees[props.chainId][props.txData.id]);
      setTxSpeedLevel(transactionSpeeds[props.chainId][props.txData.id]);
      setNextTxFeeCost(getNextTxFeeCost(props.chainId, props.txData.id));
      setNextTxSpeedCost(getNextTxSpeedCost(props.chainId, props.txData.id));
    }
  }, [
    props.chainId,
    props.txData.id,
    props.isDapp,
    transactionFees,
    transactionSpeeds,
    dappFees,
    dappSpeeds,
    getNextTxFeeCost,
    getNextTxSpeedCost,
    getNextDappFeeCost,
    getNextDappSpeedCost,
  ]);
  return (
    <View className="flex flex-col w-full">
      <View className="flex flex-row w-full mb-[4px]">
        <IconWithLock
          txIcon={getTxIcon(props.chainId, props.txData.id, props.isDapp)}
          locked={txFeeLevel === -1}
        />
        <TxDetails
          name={props.txData.name}
          description={props.txData.description}
        />
      </View>
      <TransactionUpgradeActions
        locked={txFeeLevel === -1}
        nextCost={nextTxFeeCost}
        onBuyPress={() => {
          if (props.isDapp) {
            dappFeeUpgrade(props.chainId, props.txData.id);
          } else {
            txFeeUpgrade(props.chainId, props.txData.id);
          }
        }}
        feeProps={{
          level: txFeeLevel,
          maxLevel: props.txData.feeCosts.length,
          nextCost: nextTxFeeCost,
          onPress: () => {
            if (props.isDapp) {
              dappFeeUpgrade(props.chainId, props.txData.id);
            } else {
              txFeeUpgrade(props.chainId, props.txData.id);
            }
          },
          icon: moneyImg,
          color: props.txData.color.substring(0, 7) + "f0",
        }}
        speedProps={{
          level: txSpeedLevel,
          maxLevel: props.txData.speedCosts.length,
          nextCost: nextTxSpeedCost,
          onPress: () => {
            if (props.isDapp) {
              dappSpeedUpgrade(props.chainId, props.txData.id);
            } else {
              txSpeedUpgrade(props.chainId, props.txData.id);
            }
          },
          icon: overclockImg,
          color: props.txData.color.substring(0, 7) + "f0",
        }}
      />
    </View>
  );
};
