import React, { useEffect, useState } from "react";
import { Image, Text, View, TouchableOpacity, Easing, Animated, useAnimatedValue } from "react-native";
import { Dimensions } from 'react-native';
import { useGame } from "../../context/Game";
import { useTransactions } from "../../context/Transactions";
import { newTransaction } from "../../types/Chains";
import { getTxIcon } from "../../utils/transactions";
import questionMarkIcon from "../../../assets/images/questionMark.png";
import lockImg from "../../../assets/images/lock.png";
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "../../context/Tutorial";
import { shortMoneyString } from "../../utils/helpers";
import { Canvas, Image as SkiaImg, useImage, FilterMode, MipmapMode } from '@shopify/react-native-skia';

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
  const enabled = props.txType.name === "Transfer" && props.chainId === 0 && !props.isDapp
  const { ref, onLayout } = useTutorialLayout("firstTransactionButton" as TargetId, enabled);
  
  const [feeLevel, setFeeLevel] = useState<number>(-1);

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
    const newTx = newTransaction(props.txType.id, fee, icon, props.isDapp);
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

  const txBackgroundImg = useImage(require("../../../assets/transactions/backgrounds/button_green_empty.png"));
  const txNameplateImg = useImage(require("../../../assets/transactions/nameplate/nameplate_green.png"));
  const txIconImg = useImage(require("../../../assets/transactions/icons/icon_tx_lg.png"));
  const txPlaqueImg = useImage(require("../../../assets/transactions/value_plaque.png"));

  return (
    <View className="relative">
      <TouchableOpacity
        ref={ref}
        onLayout={onLayout}
        style={{
          width: window.width * 0.18,
        }}
        className="relative h-[94px]"
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
        }}
      >
      <View className="absolute h-[94px]" style={{
        width: window.width * 0.185,
      }}>
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <SkiaImg
            image={txBackgroundImg}
            fit="fill"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
            x={0}
            y={0}
            width={window.width * 0.185}
            height={94}
          />
        </Canvas>
      </View>
      <View className="absolute h-[94px]" style={{
        width: window.width * 0.18,
      }}>
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <SkiaImg
            image={txNameplateImg}
            fit="contain"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
            x={0}
            y={2}
            width={window.width * 0.18}
            height={19}
          />
        </Canvas>
      </View>
      <Text className="absolute top-[4px] w-full text-center text-[1rem] font-bold text-[#fff8ff] font-Pixels">
        {props.txType.name}
      </Text>
      <View className="absolute h-[94px]" style={{
        width: window.width * 0.18,
      }}>
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <SkiaImg
            image={txIconImg}
            fit="contain"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
            x={0}
            y={35}
            width={window.width * 0.18}
            height={40}
          />
        </Canvas>
      </View>
      {feeLevel === -1 && (
        <View
          className="absolute w-full h-full bg-[#292929d9]
                     flex items-center justify-center
                     pointer-events-none
                     top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
        >
          <Image
            source={lockImg}
            className="w-full h-full object-contain p-2 mb-3"
          />
        </View>
      )}
    </TouchableOpacity>
    <View className="absolute bottom-[-22px] left-0 h-[20px]" style={{
        width: window.width * 0.18,
      }}>
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <SkiaImg
          image={txPlaqueImg}
          fit="contain"
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
          x={0}
          y={0}
          width={window.width * 0.18}
          height={20}
        />
      </Canvas>
    </View>
    <View className="absolute bottom-[-22px] left-0 w-full h-[20px] justify-center">
      <Text className="text-[1rem] font-bold text-[#fff8ff] font-Pixels text-right pr-1">
        {feeLevel === -1 ? "-" : "+"}
        {shortMoneyString(feeLevel === -1 ? feeCost : fee)}
      </Text>
    </View>
  </View>
  );
}
