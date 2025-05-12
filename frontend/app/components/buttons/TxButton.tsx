import React, { useEffect, useState, useRef } from "react";
import { Image, Text, View, TouchableOpacity, Easing, Animated, useAnimatedValue, LayoutRectangle, LayoutChangeEvent } from "react-native";
import { Dimensions } from 'react-native';
import { useGame } from "../../context/Game";
import { useTransactions } from "../../context/Transactions";
import { newTransaction } from "../../types/Chains";
import { getTxIcon } from "../../utils/transactions";
import questionMarkIcon from "../../../assets/images/questionMark.png";
import lockImg from "../../../assets/images/lock.png";
import { useTutorial } from "../../context/Tutorial";

const window = Dimensions.get('window');

export type TxButtonProps = {
  chainId: number;
  txType: any; // TODO: Define a proper type for txType
  isDapp?: boolean;
};

export const TxButton: React.FC<TxButtonProps> = (props) => {
  const { addTransaction } = useGame();
  const { transactionFees, dappFees, getNextTxFeeCost, getNextDappFeeCost,
          getTransactionFee, getTransactionSpeed, getDappFee, getDappSpeed,
          txFeeUpgrade, dappFeeUpgrade
        } = useTransactions();
  const { step, registerLayout } = useTutorial();
  const [feeLevel, setFeeLevel] = useState<number>(-1);
  const containerRef = useRef<View>(null);
  const tutorialTarget = step == "transactions" && props.txType.name == "Transfer" && props.chainId == 0 && !props.isDapp
  useEffect(() => {
    const chainId = props.chainId;
    if (props.isDapp) {
      setFeeLevel(dappFees[chainId]?.[props.txType.id]);
    } else {
      setFeeLevel(transactionFees[chainId]?.[props.txType.id]);
    }
  }, [props.chainId, props.txType.id, props.isDapp, transactionFees, dappFees]);
  const [feeCost, setFeeCost] = useState<number>(0);
  useEffect(() => {
    const chainId = props.chainId;
    if (props.isDapp) {
      setFeeCost(getNextDappFeeCost(chainId, props.txType.id));
    } else {
      setFeeCost(getNextTxFeeCost(chainId, props.txType.id));
    }
  }, [props.chainId, props.txType.id, props.isDapp, getNextTxFeeCost, getNextDappFeeCost]);

  const [fee, setFee] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  useEffect(() => {
    const chainId = props.chainId;

    if (props.isDapp) {
      setFee(getDappFee(chainId, props.txType.id));
      setSpeed(getDappSpeed(chainId, props.txType.id));
    } else {
      setFee(getTransactionFee(chainId, props.txType.id));
      setSpeed(getTransactionSpeed(chainId, props.txType.id));
    }
  }, [props.chainId, props.txType.id, props.isDapp, getTransactionFee, getTransactionSpeed, getDappFee, getDappSpeed]);

  const addNewTransaction = async () => {
    const newTx = newTransaction(props.txType.id, fee, icon);
    setIcon(getTxIcon(props.chainId, props.txType.id, props.isDapp));
    addTransaction(props.chainId, newTx);
  }

  const [icon, setIcon] = useState<any>(questionMarkIcon);
  useEffect(() => {
    setIcon(getTxIcon(props.chainId, props.txType.id, props.isDapp));
  }, [props.chainId, props.txType.id, props.isDapp, getTxIcon]);

  const sequenceAnim = useAnimatedValue(0);
  const [sequencedDone, setSequencedDone] = useState(0);
  useEffect(() => {
    if (speed <= 0) return;
    const randomValue = Math.floor(Math.random() * 300) - 150;
    Animated.timing(sequenceAnim, {
      toValue: 100,
      easing: Easing.linear,
      duration: (5000 / speed) + randomValue,
      useNativeDriver: false,
    }).start(() => {
      sequenceAnim.setValue(0);
      addNewTransaction();
      setSequencedDone(sequencedDone + 1);
    });
  }, [sequencedDone, speed]);

  return (
    <View ref={containerRef}>
      <TouchableOpacity
        style={{
          backgroundColor: props.txType.color,
          borderColor: props.txType.color,
          width: window.width * 0.16,
          height: window.width * 0.16,
        }}
        className="flex flex-col items-center justify-center rounded-lg border-2 relative"
        onPress={() => {
          if (feeLevel === -1) {
            if (props.isDapp) {
              dappFeeUpgrade(props.chainId, props.txType.id);
            } else {
              txFeeUpgrade(props.chainId, props.txType.id);
            }
            return;
            }
            addNewTransaction();
          }
        }
      onLayout={() => {
        console.log("layout")
        if (tutorialTarget) {
          containerRef.current?.measureInWindow((x, y, width, height) => {
            registerLayout("transactions", { x, y, width, height });
          });
        }
      }}
      >
      <View className="w-full h-full relative overflow-hidden">
        <Image
          source={icon}
          className="w-full h-full object-contain p-1"
        />
        {speed > 0 && (
          <Animated.View
            className="absolute bg-[#f9f9f980] rounded-full
                       top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%]"
            style={{
              height: sequenceAnim,
              width: sequenceAnim
            }}
          />
        )}
      </View>
      {feeLevel === -1 && (
        <View
          className="absolute w-full h-full bg-[#292929d9] rounded-lg
                     flex items-center justify-center
                     border-2 border-[#f9f9f920] pointer-events-none
                     top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
        >
          <Image
            source={lockImg}
            className="w-full h-full object-contain p-2 mb-3"
          />
        </View>
      )}
      <Text
        className="absolute top-0 w-full text-center text-[0.6rem] font-bold"
        style={{
          color: feeLevel === -1 ? props.txType.color : "#292929d0",
        }}
      >
        {props.txType.name}
      </Text>
      <Text
        className="absolute w-[4.2rem] border-2 bg-[#292929] rounded-lg
                   bottom-[-1rem] text-center text-[1rem] font-bold"
        style={{
          color: feeLevel === -1 ? "#f76060a0" : "#60f760a0",
          borderColor: props.txType.color,
        }}
      >
        {feeLevel === -1 ? "" : "+"}
        ₿
        {feeLevel === -1 ? feeCost : fee.toFixed(0)}
      </Text>
    </TouchableOpacity>
  </View>
  );
}
