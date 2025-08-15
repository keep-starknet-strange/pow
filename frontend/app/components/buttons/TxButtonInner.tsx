import React, { memo, useEffect, useCallback, useState } from "react";
import { View, Text } from "react-native";
import { useInterval } from "usehooks-ts";
import {
  Canvas,
  ImageShader,
  Image,
  FilterMode,
  MipmapMode,
  Rect,
} from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";
import { useImages } from "../../hooks/useImages";
import { useCachedWindowDimensions } from "../../hooks/useCachedDimensions";
import { useTransactionsStore } from "../../stores/useTransactionsStore";
import {
  getTxBg,
  getTxIcon,
  getTxInner,
  getTxNameplate,
} from "../../utils/transactions";
import { newTransaction } from "../../types/Chains";
import {
  Easing,
  runOnJS,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export interface TxButtonInnerProps {
  chainId: number;
  txId: number;
  isDapp: boolean;
  feeLevel: number;
  name: string;
  triggerTxAnimation?: () => void;
  addTransaction: (chainId: number, transaction: any) => void;
}

export const TxButtonInner = memo(
  (props: TxButtonInnerProps) => {
    const { getImage } = useImages();
    const { width } = useCachedWindowDimensions();
    const { getFee, getSpeed } = useTransactionsStore();
    const transactionUnlocked = props.feeLevel !== -1;

    const automationAnimHeight = useSharedValue(94);
    const automationAnimY = useDerivedValue(() => {
      return 94 - automationAnimHeight.value;
    }, []);

    const fee = getFee(props.chainId, props.txId, props.isDapp);
    const addNewTransaction = useCallback(
      async (finished: boolean | undefined) => {
        if (finished === false) return;

        // Trigger animation if provided
        if (props.triggerTxAnimation) {
          props.triggerTxAnimation();
        }

        const newTx = newTransaction(props.txId, fee, props.isDapp);
        props.addTransaction(props.chainId, newTx);
      },
      [
        props.chainId,
        props.txId,
        props.isDapp,
        props.triggerTxAnimation,
        props.addTransaction,
      ],
    );

    const speed = getSpeed(props.chainId, props.txId, props.isDapp);

    useEffect(() => {
      if (speed > 0) {
        automationAnimHeight.value = 0;
        // Only trigger automation if it's not the initial mount/re-render
        automationAnimHeight.value = withSequence(
          withTiming(
            94,
            {
              duration: 5000 / speed,
              easing: Easing.cubic,
            },
            (finished) => runOnJS(addNewTransaction)(finished),
          ),
          withTiming(0, {
            duration: 200,
            easing: Easing.bounce,
          }),
        );
      } else {
        automationAnimHeight.value = 94;
      }

      return () => {
        automationAnimHeight.value = 94; // Reset to default height when unmounted
      };
    }, [speed]);
    useInterval(
      () => {
        automationAnimHeight.value = withSequence(
          withTiming(
            94,
            {
              duration: 5000 / speed,
              easing: Easing.cubic,
            },
            (finished) => runOnJS(addNewTransaction)(finished),
          ),
          withTiming(0, {
            duration: 200,
            easing: Easing.bounce,
          }),
        );
      },
      speed > 0 ? 5000 / speed + 200 : null,
    );

    return (
      <View className="w-full h-[94px] relative">
        <View
          className="absolute h-[94px]"
          style={{
            width: width * 0.185,
          }}
        >
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getTxBg(props.chainId, props.txId, props.isDapp, getImage)}
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
        {transactionUnlocked && (
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
                  image={getTxInner(
                    props.chainId,
                    props.txId,
                    props.isDapp,
                    getImage,
                  )}
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
        {transactionUnlocked && (
          <View
            className="absolute left-[3px] h-[94px] w-full"
            style={{
              width: width * 0.17,
            }}
          >
            <Canvas style={{ flex: 1 }} className="w-full h-full">
              <Image
                image={getTxNameplate(
                  props.chainId,
                  props.txId,
                  props.isDapp,
                  getImage,
                )}
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
              {props.name}
            </Text>
          </View>
        )}
        {transactionUnlocked ? (
          <View
            className="absolute h-[94px]"
            style={{
              width: width * 0.18,
            }}
          >
            <Canvas style={{ flex: 1 }} className="w-full h-full">
              <Image
                image={getTxIcon(
                  props.chainId,
                  props.txId,
                  props.isDapp,
                  getImage,
                )}
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
              <Image
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
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.feeLevel === nextProps.feeLevel &&
      prevProps.chainId === nextProps.chainId &&
      prevProps.txId === nextProps.txId &&
      prevProps.isDapp === nextProps.isDapp
    );
  },
);
