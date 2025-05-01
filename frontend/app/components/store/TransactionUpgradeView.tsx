import React, {useEffect, useState} from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import lockImg from "../../../assets/images/lock.png";
import moneyImg from "../../../assets/images/money.png";
import overclockImg from "../../../assets/images/overclock.png";
import { useTransactions } from "../../context/Transactions";
import { getTxIcon } from "../../utils/transactions";

export type TransactionUpgradeViewProps = {
  chainId: number;
  txData: any; // TODO: define a proper type for txData
  isDapp?: boolean;
}

export const TransactionUpgradeView: React.FC<TransactionUpgradeViewProps> = (props) => {
  const {
    transactionFees, transactionSpeeds, dappFees, dappSpeeds,
    getNextTxFeeCost, getNextTxSpeedCost, getNextDappFeeCost, getNextDappSpeedCost,
    txFeeUpgrade, txSpeedUpgrade, dappFeeUpgrade, dappSpeedUpgrade
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
    props.chainId, props.txData.id, props.isDapp,
    transactionFees, transactionSpeeds, dappFees, dappSpeeds,
    getNextTxFeeCost, getNextTxSpeedCost, getNextDappFeeCost, getNextDappSpeedCost
  ]);

  return (
    <View className="flex flex-row w-full items-center">   
      <View
        className="flex flex-col justify-center rounded-lg border-2 border-[#e7e7e740] relative w-[4.5rem] h-[4.5rem]"
        style={{
          backgroundColor: props.txData?.color
        }}
      >
        <Image source={txIcon} className="w-full h-full rounded-lg p-1"/>
        {txFeeLevel === -1 && (
          <View className="absolute w-full h-full top-0 left-0 flex justify-center items-center bg-[#272727c0] rounded-lg">
            <Image source={lockImg} className="w-[3rem] h-[3rem]" />
          </View>
        )}
      </View>
      <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
        <Text className="text-[#e7e7e7] text-xl font-bold">{props.txData?.name}</Text>
        <Text className="text-[#e7e7e7] text-md">{props.txData?.description}</Text>
      </View>
      {txFeeLevel === -1 ? (
        <TouchableOpacity
          className="flex justify-center items-center bg-[#f7f760d0] rounded-lg p-2 relative
                     border-2 border-[#e7e7e770] mr-1"
          onPress={() => {
            if (props.isDapp) {
              dappFeeUpgrade(props.chainId, props.txData.id);
            } else {
              txFeeUpgrade(props.chainId, props.txData.id);
            }
          }}
        >
          <Text
            className="w-[6rem] text-center"
          >
            Buy ₿{nextTxFeeCost}
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="flex flex-row justify-center items-center">
          <TouchableOpacity
            className="flex justify-center items-center bg-[#e7e7e730] rounded-lg p-2 relative
                       border-2 border-[#e7e7e770] mr-1"
            onPress={() => {
              if (props.isDapp) {
                dappFeeUpgrade(props.chainId, props.txData.id);
              } else {
                txFeeUpgrade(props.chainId, props.txData.id);
              }
            }}
          >
            <Image source={moneyImg} className="w-[3rem] h-[3rem] p-1"/>
            <Text
              className="absolute bottom-[-1rem] text-center px-1 w-[3.6rem]
                         border-2 border-[#e7e7e770] rounded-xl text-[#171717] text-sm font-bold"
              style={{
                backgroundColor: props.txData?.color.substring(0, 7) + "f0"
              }}
            >
              {txFeeLevel + 1}/{props.txData?.feeCosts.length}
            </Text>
            <Text
              className="absolute top-[-0.7rem] text-center px-1 w-[3.6rem]
                         border-2 border-[#e7e7e770] rounded-xl
                         text-[#171717] text-sm font-bold bg-[#e7e760f0]"
            >
              {txFeeLevel === props.txData?.feeCosts.length ? "Max" : `₿${nextTxFeeCost}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex justify-center items-center bg-[#e7e7e730] rounded-lg p-2 relative
                       border-2 border-[#e7e7e770] mr-1"
            onPress={() => {
              if (props.isDapp) {
                dappSpeedUpgrade(props.chainId, props.txData.id);
              } else {
                txSpeedUpgrade(props.chainId, props.txData.id);
              }
            }}
          >
            <Image source={overclockImg} className="w-[3rem] h-[3rem] p-1" />
            <Text
              className="absolute bottom-[-1rem] text-center px-1 w-[3.6rem]
                         border-2 border-[#e7e7e770] rounded-xl text-[#171717] text-sm font-bold"
              style={{
                backgroundColor: props.txData?.color.substring(0, 7) + "f0"
              }}
            >
              {txSpeedLevel + 1}/{props.txData?.speedCosts.length}
            </Text>
            <Text
              className="absolute top-[-0.7rem] text-center px-1 w-[3.6rem]
                         border-2 border-[#e7e7e770] rounded-xl
                         text-[#171717] text-sm font-bold bg-[#e7e760f0]"
            >
              {txSpeedLevel === props.txData?.speedCosts.length ? "Max" : `₿${nextTxSpeedCost}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
