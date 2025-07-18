import React, { useCallback, useEffect, useState } from "react";
import { Image, Text, View, TouchableOpacity } from "react-native";
import { Dimensions } from "react-native";
import { useGame } from "../../context/Game";
import { useTransactions } from "../../context/Transactions";
import { useImages } from "../../hooks/useImages";
import { newTransaction } from "../../types/Chains";
import lockImg from "../../../assets/images/lock.png";
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "../../stores/useTutorialStore";
import { shortMoneyString } from "../../utils/helpers";
import transactionConfig from "../../configs/transactions.json";
import { PopupAnimation } from "../../components/PopupAnimation";
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
  ImageShader,
  Rect,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export type TxButtonProps = {
  chainId: number;
  txType: any; // TODO: Define a proper type for txType
  isDapp: boolean;
};

export const TxButton: React.FC<TxButtonProps> = (props) => {
  const { getImage } = useImages();
  const { width } = Dimensions.get("window");
  const { addTransaction, workingBlocks } = useGame();
  const {
    transactionFees,
    dappFees,
    getNextTxFeeCost,
    getNextDappFeeCost,
    getTransactionFee,
    getTransactionSpeed,
    getDappFee,
    getDappSpeed,
    txFeeUpgrade,
    dappFeeUpgrade,
    canUnlockTx,
  } = useTransactions();
  const enabled =
    props.txType.name === transactionConfig.L1[0].name &&
    props.chainId === 0 &&
    !props.isDapp;
  const { ref, onLayout } = useTutorialLayout(
    "firstTransactionButton" as TargetId,
    enabled,
  );

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
  }, [
    props.chainId,
    props.txType.id,
    props.isDapp,
    getNextTxFeeCost,
    getNextDappFeeCost,
  ]);

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
  }, [
    props.chainId,
    props.txType.id,
    props.isDapp,
    getTransactionFee,
    getTransactionSpeed,
    getDappFee,
    getDappSpeed,
  ]);

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
    const newTx = newTransaction(props.txType.id, fee, props.isDapp);
    addTransaction(props.chainId, newTx);
    setLastTxTime(Date.now());
    shakeAnim.value *= -1; // Toggle the shake animation value
  }, [
    addTransaction,
    props.chainId,
    props.txType.id,
    fee,
    props.isDapp,
    shakeAnim,
  ]);

  const getTxBg = (chainId: number, txId: number, isDapp: boolean) => {
    switch (chainId) {
      case 0:
        switch (txId) {
          case 0:
            return getImage("tx.button.bg.green");
          case 1:
            return getImage("tx.button.bg.yellow");
          case 2:
            return getImage("tx.button.bg.blue");
          case 3:
            return getImage("tx.button.bg.pink");
          case 4:
            return getImage("tx.button.bg.purple");
          default:
            return getImage("tx.button.bg.green");
        }
      case 1:
        switch (txId) {
          case 0:
            return getImage("tx.button.bg.purple");
          case 1:
            return getImage("tx.button.bg.green");
          case 2:
            return getImage("tx.button.bg.yellow");
          case 3:
            return getImage("tx.button.bg.blue");
          case 4:
            return getImage("tx.button.bg.pink");
          default:
            return getImage("tx.button.bg.green");
        }
      default:
        return getImage("tx.button.bg.green");
    }
  };

  const getTxInner = (chainId: number, txId: number, isDapp: boolean) => {
    switch (chainId) {
      case 0:
        switch (txId) {
          case 0:
            return getImage("tx.button.inner.green");
          case 1:
            return getImage("tx.button.inner.yellow");
          case 2:
            return getImage("tx.button.inner.blue");
          case 3:
            return getImage("tx.button.inner.pink");
          case 4:
            return getImage("tx.button.inner.purple");
          default:
            return getImage("tx.button.inner.green");
        }
      case 1:
        switch (txId) {
          case 0:
            return getImage("tx.button.inner.purple");
          case 1:
            return getImage("tx.button.inner.green");
          case 2:
            return getImage("tx.button.inner.yellow");
          case 3:
            return getImage("tx.button.inner.blue");
          case 4:
            return getImage("tx.button.inner.pink");
          default:
            return getImage("tx.button.inner.green");
        }
      default:
        return getImage("tx.button.inner.green");
    }
  };

  const getTxNameplate = (chainId: number, txId: number, isDapp: boolean) => {
    switch (chainId) {
      case 0:
        switch (txId) {
          case 0:
            return getImage("tx.nameplate.green");
          case 1:
            return getImage("tx.nameplate.yellow");
          case 2:
            return getImage("tx.nameplate.blue");
          case 3:
            return getImage("tx.nameplate.pink");
          case 4:
            return getImage("tx.nameplate.purple");
          default:
            return getImage("tx.nameplate.green");
        }
      case 1:
        switch (txId) {
          case 0:
            return getImage("tx.nameplate.purple");
          case 1:
            return getImage("tx.nameplate.green");
          case 2:
            return getImage("tx.nameplate.yellow");
          case 3:
            return getImage("tx.nameplate.blue");
          case 4:
            return getImage("tx.nameplate.pink");
          default:
            return getImage("tx.nameplate.green");
        }
      default:
        return getImage("tx.nameplate.green");
    }
  };

  const getTxIcon = (chainId: number, txId: number, isDapp: boolean) => {
    switch (chainId) {
      case 0:
        switch (txId) {
          case 0:
            return getImage("tx.icon.tx");
          case 1:
            return getImage("tx.icon.tx");
          case 2:
            return getImage("tx.icon.blob");
          case 3:
            return getImage("tx.icon.nft");
          case 4:
            return getImage("tx.icon.nft");
          default:
            return getImage("tx.icon.tx");
        }
      case 1:
        switch (txId) {
          case 0:
            return getImage("tx.icon.tx");
          case 1:
            return getImage("tx.icon.tx");
          case 2:
            return getImage("tx.icon.blob");
          case 3:
            return getImage("tx.icon.nft");
          case 4:
            return getImage("tx.icon.nft");
          default:
            return getImage("tx.icon.tx");
        }
      default:
        return getImage("tx.icon.tx");
    }
  };

  const automationAnimHeight = useSharedValue(94);
  const automationAnimY = useDerivedValue(() => {
    return 94 - automationAnimHeight.value;
  }, [automationAnimHeight]);
  useEffect(() => {
    if (workingBlocks[props.chainId]?.isBuilt) {
      automationAnimHeight.value = 94;
      return;
    }
    let randomDurationOffset = Math.random() * 500;
    const interval = setInterval(
      () => {
        randomDurationOffset = Math.random() * 500;
        if (speed > 0) {
          automationAnimHeight.value = withSequence(
            withTiming(
              94,
              {
                duration: 5000 / speed + randomDurationOffset,
                easing: Easing.cubic,
              },
              () => runOnJS(addNewTransaction)(),
            ),
            withTiming(0, {
              duration: 200,
              easing: Easing.bounce,
            }),
          );
        } else {
          automationAnimHeight.value = 94;
        }
      },
      5000 / speed + 200 + randomDurationOffset,
    );
    return () => clearInterval(interval);
  }, [
    speed,
    automationAnimHeight,
    addNewTransaction,
    workingBlocks,
    props.chainId,
  ]);

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
        <TouchableOpacity
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
                dappFeeUpgrade(props.chainId, props.txType.id);
              } else {
                txFeeUpgrade(props.chainId, props.txType.id);
              }
              return;
            }
            addNewTransaction();
          }}
        >
          <View
            className="absolute h-[94px]"
            style={{
              width: width * 0.185,
            }}
          >
            <Canvas style={{ flex: 1 }} className="w-full h-full">
              <SkiaImg
                image={getTxBg(props.chainId, props.txType.id, false)}
                fit="fill"
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                x={0}
                y={0}
                width={width * 0.185}
                height={94}
              />
            </Canvas>
          </View>
          {feeLevel !== -1 && (
            <View
              className="absolute bottom-0 h-full"
              style={{
                width: width * 0.18,
              }}
            >
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <Rect
                  x={0}
                  y={automationAnimY}
                  width={width * 0.18}
                  height={automationAnimHeight}
                >
                  <ImageShader
                    image={getTxInner(props.chainId, props.txType.id, false)}
                    fit="fill"
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.Nearest,
                    }}
                    rect={{ x: 0, y: 0, width: width * 0.18, height: 94 }}
                  />
                </Rect>
              </Canvas>
            </View>
          )}
          {feeLevel !== -1 && (
            <View
              className="absolute left-[3px] h-[94px] w-full"
              style={{
                width: width * 0.17,
              }}
            >
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <SkiaImg
                  image={getTxNameplate(props.chainId, props.txType.id, false)}
                  fit="fill"
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  x={0}
                  y={2}
                  width={width * 0.165}
                  height={19}
                />
              </Canvas>
              <Text className="absolute left-0 top-[4px] w-full text-center text-[16px] text-[#fff8ff] font-Pixels">
                {props.txType.name}
              </Text>
            </View>
          )}
          {feeLevel === -1 ? (
            <View
              className="absolute w-full h-full
                     pointer-events-none
                     top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
              style={{
                width: width * 0.18,
              }}
            >
              <Canvas
                style={{ flex: 1 }}
                className="w-full h-full flex justify-center items-center"
              >
                <SkiaImg
                  image={getImage("shop.lock")}
                  fit="contain"
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  x={0}
                  y={30}
                  width={width * 0.18}
                  height={40}
                />
              </Canvas>
            </View>
          ) : (
            <View
              className="absolute h-[94px]"
              style={{
                width: width * 0.18,
              }}
            >
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <SkiaImg
                  image={getTxIcon(props.chainId, props.txType.id, false)}
                  fit="contain"
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  x={0}
                  y={30}
                  width={width * 0.18}
                  height={40}
                />
              </Canvas>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      <View
        className="h-[20px]"
        style={{
          width: width * 0.18,
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <SkiaImg
            image={getImage(
              feeLevel === -1 ? "tx.plaque.minus" : "tx.plaque.plus",
            )}
            fit="fill"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={0}
            width={width * 0.18}
            height={20}
          />
        </Canvas>
      </View>
      {canUnlockTx(props.chainId, props.txType.id, props.isDapp) && (
        <View className="absolute bottom-[0px] left-0 w-full h-[20px] justify-end flex flex-row">
          <Text className="text-[14px] text-[#fff8ff] font-Pixels text-right mt-[1px]">
            {shortMoneyString(feeLevel === -1 ? feeCost : fee)}
          </Text>
          <Canvas style={{ width: 16, height: 16 }} className="mr-1">
            <SkiaImg
              image={getImage("shop.btc")}
              fit="contain"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              x={0}
              y={1}
              width={13}
              height={13}
            />
          </Canvas>
        </View>
      )}
    </View>
  );
};
