import React, { useEffect, useState } from "react";
import { Image, Text, View, TouchableOpacity, Easing, Animated, useAnimatedValue } from "react-native";
import { Dimensions } from 'react-native';
import { useGame } from "../../context/Game";
import { useTransactions } from "../../context/Transactions";
import { useImageProvider } from "../../context/ImageProvider";
import { newTransaction } from "../../types/Chains";
import { getTxIcon } from "../../utils/transactions";
import questionMarkIcon from "../../../assets/images/questionMark.png";
import lockImg from "../../../assets/images/lock.png";
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "../../context/Tutorial";
import { shortMoneyString } from "../../utils/helpers";
import { Canvas, Image as SkiaImg, FilterMode, MipmapMode } from '@shopify/react-native-skia';

const window = Dimensions.get('window');

export type TxButtonProps = {
  chainId: number;
  txType: any; // TODO: Define a proper type for txType
  isDapp?: boolean;
};

export const TxButton: React.FC<TxButtonProps> = (props) => {
  const { getImage } = useImageProvider();
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
      toValue: 94,
      easing: Easing.linear,
      duration: (5000 / speed) + randomValue,
      useNativeDriver: false,
    }).start(() => {
      sequenceAnim.setValue(0);
      addNewTransaction();
      setSequencedDone(sequencedDone + 1);
    });
  }, [sequencedDone, speed]);

  const getTxBg = (chainId: number, txId: number, isDapp: boolean) => {
    switch (chainId) {
      case 0:
        switch (txId) {
          case 0:
            return getImage('tx.button.bg.green');
          case 1:
            return getImage('tx.button.bg.yellow');
          case 2:
            return getImage('tx.button.bg.blue');
          case 3:
            return getImage('tx.button.bg.pink');
          case 4:
            return getImage('tx.button.bg.purple');
          default:
            return getImage('tx.button.bg.green');
        }
      case 1:
        switch (txId) {
          case 0:
            return getImage('tx.button.bg.purple');
          case 1:
            return getImage('tx.button.bg.green');
          case 2:
            return getImage('tx.button.bg.yellow');
          case 3:
            return getImage('tx.button.bg.blue');
          case 4:
            return getImage('tx.button.bg.pink');
          default:
            return getImage('tx.button.bg.green');
        }
      default:
        return getImage('tx.button.bg.green');
    }
  }

  const getTxInner = (chainId: number, txId: number, isDapp: boolean) => {
    switch (chainId) {
      case 0:
        switch (txId) {
          case 0:
            return getImage('tx.button.inner.green');
          case 1:
            return getImage('tx.button.inner.yellow');
          case 2:
            return getImage('tx.button.inner.blue');
          case 3:
            return getImage('tx.button.inner.pink');
          case 4:
            return getImage('tx.button.inner.purple');
          default:
            return getImage('tx.button.inner.green');
        }
      case 1:
        switch (txId) {
          case 0:
            return getImage('tx.button.inner.purple');
          case 1:
            return getImage('tx.button.inner.green');
          case 2:
            return getImage('tx.button.inner.yellow');
          case 3:
            return getImage('tx.button.inner.blue');
          case 4:
            return getImage('tx.button.inner.pink');
          default:
            return getImage('tx.button.inner.green');
        }
      default:
        return getImage('tx.button.inner.green');
    }
  }

  const getTxNameplate = (chainId: number, txId: number, isDapp: boolean) => {
    switch (chainId) {
      case 0:
        switch (txId) {
          case 0:
            return getImage('tx.nameplate.green');
          case 1:
            return getImage('tx.nameplate.yellow');
          case 2:
            return getImage('tx.nameplate.blue');
          case 3:
            return getImage('tx.nameplate.pink');
          case 4:
            return getImage('tx.nameplate.purple');
          default:
            return getImage('tx.nameplate.green');
        }
      case 1:
        switch (txId) {
          case 0:
            return getImage('tx.nameplate.purple');
          case 1:
            return getImage('tx.nameplate.green');
          case 2:
            return getImage('tx.nameplate.yellow');
          case 3:
            return getImage('tx.nameplate.blue');
          case 4:
            return getImage('tx.nameplate.pink');
          default:
            return getImage('tx.nameplate.green');
        }
      default:
        return getImage('tx.nameplate.green');
    }
  }

  const getTxIcon = (chainId: number, txId: number, isDapp: boolean) => {
    switch (chainId) {
      case 0:
        switch (txId) {
          case 0:
            return getImage('tx.icon.tx');
          case 1:
            return getImage('tx.icon.tx');
          case 2:
            return getImage('tx.icon.blob');
          case 3:
            return getImage('tx.icon.nft');
          case 4:
            return getImage('tx.icon.nft');
          default:
            return getImage('tx.icon.tx');
        }
      case 1:
        switch (txId) {
          case 0:
            return getImage('tx.icon.tx');
          case 1:
            return getImage('tx.icon.tx');
          case 2:
            return getImage('tx.icon.blob');
          case 3:
            return getImage('tx.icon.nft');
          case 4:
            return getImage('tx.icon.nft');
          default:
            return getImage('tx.icon.tx');
        }
      default:
        return getImage('tx.icon.tx');
    }
  }

  return (
    <View className="relative">
      <TouchableOpacity
        ref={ref}
        onLayout={onLayout}
        style={{
          width: window.width * 0.18,
        }}
        className="relative h-[94px] overflow-hidden"
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
            image={getTxBg(props.chainId, props.txType.id, false)}
            fit="fill"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
            x={0}
            y={0}
            width={window.width * 0.185}
            height={94}
          />
        </Canvas>
      </View>
      <Animated.View className="absolute w-full bottom-0"
        style={{
          width: window.width * 0.18,
          height: speed > 0 ? sequenceAnim : '100%'
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
        <SkiaImg
          image={getTxInner(props.chainId, props.txType.id, false)}
          fit="fill"
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
          x={0}
          y={0}
          width={window.width * 0.18}
          height={94}
        />
        </Canvas>
      </Animated.View>
      <View className="absolute left-[3px] h-[94px] w-full" style={{
        width: window.width * 0.17,
      }}>
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <SkiaImg
            image={getTxNameplate(props.chainId, props.txType.id, false)}
            fit="fill"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
            x={0}
            y={2}
            width={window.width * 0.165}
            height={19}
          />
        </Canvas>
      </View>
      <Text className="absolute left-[2px] top-[4px] w-full text-center text-[1rem] font-bold text-[#fff8ff] font-Pixels">
        {props.txType.name}
      </Text>
      <View className="absolute h-[94px]" style={{
        width: window.width * 0.18,
      }}>
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <SkiaImg
            image={getTxIcon(props.chainId, props.txType.id, false)}
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
          image={getImage('tx.plaque')}
          fit="fill"
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
