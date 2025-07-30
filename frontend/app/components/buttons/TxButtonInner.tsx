import React, { memo, useEffect, useCallback, useState } from "react";
import { View, Text, Dimensions } from "react-native";
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
import { useTransactionsStore } from "../../stores/useTransactionsStore";
import {
  getTxBg,
  getTxIcon,
  getTxInner,
  getTxNameplate,
} from "../../utils/transactions";
import { useGameStore } from "../../stores/useGameStore";
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
}

export const TxButtonInner = memo((props: TxButtonInnerProps) => {
  const { getImage } = useImages();
  const { width } = Dimensions.get("window");
  const { addTransaction } = useGameStore();
  const { getFee, getSpeed } = useTransactionsStore();

  const automationAnimHeight = useSharedValue(94);
  const automationAnimY = useDerivedValue(() => {
    return 94 - automationAnimHeight.value;
  }, [automationAnimHeight]);

  const fee = getFee(props.chainId, props.txId, props.isDapp);
  const addNewTransaction = useCallback(async () => {
    const newTx = newTransaction(props.txId, fee, props.isDapp);
    addTransaction(props.chainId, newTx);
  }, [props.chainId, props.txId, props.isDapp]);

  const speed = getSpeed(props.chainId, props.txId, props.isDapp);
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  useEffect(() => {
    if (speed > 0) {
      automationAnimHeight.value = 0;
      // Only trigger automation if it's not the initial mount/re-render
      if (!isInitialMount) {
        automationAnimHeight.value = withSequence(
          withTiming(
            94,
            {
              duration: 5000 / speed,
              easing: Easing.cubic,
            },
            () => runOnJS(addNewTransaction)(),
          ),
          withTiming(0, {
            duration: 200,
            easing: Easing.bounce,
          }),
        );
      }
    } else {
      automationAnimHeight.value = 94;
    }
    
    // Mark that initial mount is complete
    if (isInitialMount) {
      setIsInitialMount(false);
    }
    
    return () => {
      automationAnimHeight.value = 94; // Reset to default height when unmounted
    };
  }, [speed, isInitialMount]);
  useInterval(
    () => {
      automationAnimHeight.value = withSequence(
        withTiming(
          94,
          {
            duration: 5000 / speed,
            easing: Easing.cubic,
          },
          () => runOnJS(addNewTransaction)(),
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
      {props.feeLevel !== -1 && (
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
      {props.feeLevel !== -1 && (
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
      {props.feeLevel === -1 ? (
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
      ) : (
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
      )}
    </View>
  );
});
