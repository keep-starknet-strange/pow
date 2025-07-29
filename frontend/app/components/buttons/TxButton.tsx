import React, { memo, useCallback, useEffect, useState } from "react";
import { Image, Text, View, Pressable } from "react-native";
import { Dimensions } from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useImages } from "../../hooks/useImages";
import { newTransaction } from "../../types/Chains";
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "../../stores/useTutorialStore";
import transactionsJson from "../../configs/transactions.json";
import dappsJson from "../../configs/dapps.json";
import { shortMoneyString } from "../../utils/helpers";
import { PopupAnimation } from "../../components/PopupAnimation";
import { TxButtonInner } from "./TxButtonInner";
import { TxButtonPlaque } from "./TxButtonPlaque";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import {
  Canvas,
  Image as SkiaImg,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export type TxButtonProps = {
  chainId: number;
  txId: number;
  isDapp: boolean;
};

export const TxButton: React.FC<TxButtonProps> = memo((props) => {
  const { getImage } = useImages();
  const { width } = Dimensions.get("window");
  const { addTransaction } = useGameStore();
  const {
    getFeeLevel,
    getNextFeeCost,
    getFee,
    getSpeed,
    txFeeUpgrade,
    dappFeeUpgrade,
    canUnlockTx,
  } = useTransactionsStore();
  const enabled = props.txId === 0 && props.chainId === 0 && !props.isDapp;
  const { ref, onLayout } = useTutorialLayout(
    "firstTransactionButton" as TargetId,
    enabled,
  );

  const feeLevel = getFeeLevel(props.chainId, props.txId, props.isDapp);
  const feeCost = getNextFeeCost(props.chainId, props.txId, props.isDapp);
  const fee = getFee(props.chainId, props.txId, props.isDapp);

  const shakeAnim = useSharedValue(8);
  const shakeAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSequence(
          withTiming(Math.abs(shakeAnim.value), {
            duration: 50,
            easing: Easing.linear,
          }),
          withTiming(0, {
            duration: 50,
            easing: Easing.linear,
          }),
        ),
      },
    ],
  }));

  const [lastTxTime, setLastTxTime] = useState<number>(0);
  const addNewTransaction = useCallback(async () => {
    const newTx = newTransaction(props.txId, fee, props.isDapp);
    addTransaction(props.chainId, newTx);
    setLastTxTime(Date.now());
    shakeAnim.value *= -1; // Toggle the shake animation value
  }, [addTransaction, props.chainId, props.txId, fee, props.isDapp, shakeAnim]);

  const transactionsData =
    props.chainId === 0
      ? props.isDapp
        ? dappsJson.L1.transactions
        : transactionsJson.L1
      : props.isDapp
        ? dappsJson.L2.transactions
        : transactionsJson.L2;
  const txType = transactionsData.find((tx) => tx.id === props.txId);
  return (
    <View className="relative flex flex-col gap-[2px] py-[2px]">
      <PopupAnimation
        popupStartTime={lastTxTime}
        popupValue={`${
          feeLevel === -1
            ? "-" + shortMoneyString(feeCost)
            : "+" + shortMoneyString(fee)
        }`}
        color={feeLevel === -1 ? "#CA1F4B" : "#F0E130"}
      />
      <Animated.View style={[shakeAnimStyle]}>
        <Pressable
          ref={ref}
          onLayout={onLayout}
          style={{
            width: width * 0.18,
          }}
          className="relative h-[94px]"
          onPress={() => {
            if (feeLevel === -1) {
              setLastTxTime(Date.now());
              if (props.isDapp) {
                dappFeeUpgrade(props.chainId, props.txId);
              } else {
                txFeeUpgrade(props.chainId, props.txId);
              }
              return;
            }
            addNewTransaction();
          }}
        >
          <TxButtonInner
            feeLevel={feeLevel}
            chainId={props.chainId}
            txId={props.txId}
            isDapp={props.isDapp}
            name={txType?.name || "Unknown"}
          />
        </Pressable>
      </Animated.View>
      <TxButtonPlaque
        chainId={props.chainId}
        txId={props.txId}
        isDapp={props.isDapp}
        feeLevel={feeLevel}
        feeCost={feeCost}
        fee={fee}
      />
    </View>
  );
});
