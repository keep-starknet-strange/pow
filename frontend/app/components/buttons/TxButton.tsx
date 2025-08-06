import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Image,
  Text,
  View,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { useGameStore } from "@/app/stores/useGameStore";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useImages } from "../../hooks/useImages";
import { useCachedWindowDimensions } from "../../hooks/useCachedDimensions";
import { newTransaction } from "../../types/Chains";
import transactionsJson from "../../configs/transactions.json";
import dappsJson from "../../configs/dapps.json";
import { shortMoneyString } from "../../utils/helpers";
import {
  PopupAnimation,
  PopupAnimationRef,
} from "../../components/PopupAnimation";
import { TxFlashBurstManager } from "../TxFlashBurstManager";
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
  const { width } = useCachedWindowDimensions();
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

  const [triggerFlash, setTriggerFlash] = useState<
    ((x: number, y: number) => void) | null
  >(null);

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

  const popupRef = React.useRef<PopupAnimationRef>(null);
  const addNewTransaction = useCallback(async () => {
    const newTx = newTransaction(props.txId, fee, props.isDapp);
    const currentTime = Date.now();

    // Batch state updates to minimize rerenders
    addTransaction(props.chainId, newTx);

    // Show popup animation
    const popupValue = `${
      feeLevel === -1
        ? "-" + shortMoneyString(feeCost)
        : "+" + shortMoneyString(fee)
    }`;
    const popupColor = feeLevel === -1 ? "#CA1F4B" : "#F0E130";
    popupRef.current?.showPopup(popupValue, popupColor);

    // Use requestAnimationFrame to batch animation updates
    requestAnimationFrame(() => {
      shakeAnim.value *= -1; // Toggle the shake animation value
    });
  }, [addTransaction, props.chainId, props.txId, fee, props.isDapp, shakeAnim]);

  const triggerTxShake = useCallback(() => {
    // Show popup animation
    const popupValue = `${
      feeLevel === -1
        ? "-" + shortMoneyString(feeCost)
        : "+" + shortMoneyString(fee)
    }`;
    const popupColor = feeLevel === -1 ? "#CA1F4B" : "#F0E130";
    popupRef.current?.showPopup(popupValue, popupColor);

    shakeAnim.value *= -1; // Toggle the shake animation value
  }, [shakeAnim, feeLevel, feeCost, fee]);

  const handleFlashRequested = useCallback(
    (callback: (x: number, y: number) => void) => {
      setTriggerFlash(() => callback);
    },
    [],
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const currentTime = Date.now();

      // Batch visual feedback updates
      requestAnimationFrame(() => {
        // Trigger flash animation at click position
        if (triggerFlash) {
          triggerFlash(locationX, locationY);
        }
      });

      if (feeLevel === -1) {
        // Batch upgrade operations
        // Show popup animation for upgrade
        const popupValue = "-" + shortMoneyString(feeCost);
        const popupColor = "#CA1F4B";
        popupRef.current?.showPopup(popupValue, popupColor);

        if (props.isDapp) {
          dappFeeUpgrade(props.chainId, props.txId);
        } else {
          txFeeUpgrade(props.chainId, props.txId);
        }
        return;
      }
      addNewTransaction();
    },
    [
      triggerFlash,
      feeLevel,
      props.isDapp,
      props.chainId,
      props.txId,
      addNewTransaction,
      dappFeeUpgrade,
      txFeeUpgrade,
    ],
  );

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
      <PopupAnimation ref={popupRef} />
      <Animated.View style={[shakeAnimStyle]}>
        <Pressable
          style={{
            width: width * 0.18,
          }}
          className="relative h-[94px]"
          onPress={handlePress}
        >
          <TxButtonInner
            feeLevel={feeLevel}
            chainId={props.chainId}
            txId={props.txId}
            isDapp={props.isDapp}
            name={txType?.name || "Unknown"}
            triggerTxAnimation={triggerTxShake}
            addTransaction={addTransaction}
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
      <TxFlashBurstManager
        chainId={props.chainId}
        txId={props.txId}
        isDapp={props.isDapp}
        onFlashRequested={handleFlashRequested}
      />
    </View>
  );
});
