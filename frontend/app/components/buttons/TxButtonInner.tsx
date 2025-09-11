import React, { memo, useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
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
import { useTransactionPause } from "../../stores/useTransactionPauseStore";
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
    const { isPaused } = useTransactionPause();
    const transactionUnlocked = props.feeLevel !== -1;

    // Get the images and check if they're loaded
    const iconImage = getTxIcon(
      props.chainId,
      props.txId,
      props.isDapp,
      getImage,
    );
    const innerImage = getTxInner(
      props.chainId,
      props.txId,
      props.isDapp,
      getImage,
    );

    // iOS-specific: Force re-render when transaction is unlocked
    const [forceUpdate, setForceUpdate] = useState(0);
    useEffect(() => {
      if (
        Platform.OS === "ios" &&
        transactionUnlocked &&
        iconImage &&
        innerImage
      ) {
        // Small delay to ensure image is loaded on iOS
        const timer = setTimeout(() => {
          setForceUpdate((prev) => prev + 1);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [transactionUnlocked, iconImage, innerImage]);

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
    const paused = isPaused(props.chainId, props.txId, props.isDapp);
    const shouldAutomate = speed > 0 && !paused;

    useEffect(() => {
      if (shouldAutomate) {
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
    }, [shouldAutomate, speed]);
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
      shouldAutomate ? 5000 / speed + 200 : null,
    );

    return (
      <View style={[styles.container, { width: "100%" }]}>
        <View
          style={[
            styles.backgroundContainer,
            {
              width: width * 0.185,
            },
          ]}
        >
          <Canvas style={styles.canvas}>
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
        {transactionUnlocked && innerImage && (
          <View
            style={[
              styles.animationContainer,
              {
                width: width * 0.18,
              },
            ]}
          >
            <Canvas
              style={styles.canvas}
              key={`tx-inner-${props.chainId}-${props.txId}-${props.isDapp}-${forceUpdate}`}
            >
              <Rect
                x={0}
                y={automationAnimY}
                width={width * 0.18}
                height={automationAnimHeight}
              >
                <ImageShader
                  image={innerImage}
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
            style={[
              styles.nameplateContainer,
              {
                width: width * 0.17,
              },
            ]}
          >
            <Canvas style={styles.canvas}>
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
            <Text style={styles.nameText}>{props.name}</Text>
          </View>
        )}
        {transactionUnlocked ? (
          <View
            style={[
              styles.iconContainer,
              {
                width: width * 0.18,
              },
            ]}
          >
            {iconImage && (
              <Canvas
                style={styles.canvas}
                key={`tx-icon-${props.chainId}-${props.txId}-${props.isDapp}-${props.feeLevel}-${forceUpdate}`}
              >
                <Image
                  image={iconImage}
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
            )}
          </View>
        ) : (
          <View
            style={[
              styles.lockContainer,
              {
                width: width * 0.18,
              },
            ]}
          >
            <Canvas style={styles.lockCanvas}>
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

const styles = StyleSheet.create({
  container: {
    height: 94,
    position: "relative",
  },
  backgroundContainer: {
    position: "absolute",
    height: 94,
  },
  animationContainer: {
    position: "absolute",
    bottom: 0,
    height: "100%",
  },
  nameplateContainer: {
    position: "absolute",
    left: 3,
    height: 94,
  },
  iconContainer: {
    position: "absolute",
    height: 94,
  },
  lockContainer: {
    position: "absolute",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  canvas: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  lockCanvas: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    position: "absolute",
    left: 0,
    top: 4,
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    color: "#fff8ff",
    fontFamily: "Pixels",
  },
});
