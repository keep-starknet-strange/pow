import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import messagesJson from "../configs/messages.json";
import { useUpgrades } from "../context/Upgrades";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { TargetId } from "../context/Tutorial";
import { Block } from "../types/Chains";
import { getTxStyle } from "../utils/transactions";
import feeImg from "../../assets/images/bitcoin.png";
import { shortMoneyString } from "../utils/helpers";
import { Canvas, Image as SkiaImg, useImage, FilterMode, MipmapMode } from '@shopify/react-native-skia';

export type BlockViewProps = {
  chainId: number;
  block: Block | null;
  completed: boolean;
};

export const BlockView: React.FC<BlockViewProps> = (props) => {
  const { currentPrestige, getUpgradeValue } = useUpgrades();
  const [txWidth, setTxWidth] = useState<number>(100 / Math.ceil(Math.sqrt(props.block?.transactions.length || 1)));
  const enabled = props.block?.blockId === 0
  const { ref, onLayout } = useTutorialLayout("blockView" as TargetId, enabled);
  useEffect(() => {
    const maxBlockSize = getUpgradeValue(props.chainId, "Block Size")**2;
    // setTxWidth(100 / Math.ceil(Math.sqrt(props.block?.transactions.length || 1)));
    setTxWidth(100 / Math.ceil(Math.sqrt(maxBlockSize || props.block?.transactions.length || 1)));
  }, [props.block?.transactions.length]);

  const yOffset = useSharedValue(600);

  const animatedObjectStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: yOffset.value }],
    };
  });

  const animate = () => {
    yOffset.value = withTiming(0, { duration: 250 });
  };

  useEffect(() => {
    yOffset.value = 600; // Start off-scren
    animate();
  }, [props.block?.transactions.length]);

  const maxBlockSize = getUpgradeValue(props.chainId, "Block Size") ** 2;
  const emptyTxImg = useImage(require("../../assets/block/backgrounds/blockchain_block_empty.png"));

  const txTxBlockIcon = useImage(require("../../assets/block/icons/icon_tx_sm.png"));
  const txBlobBlockIcon = useImage(require("../../assets/block/icons/icon_blob_sm.png"));
  const txDappBlockIcon = useImage(require("../../assets/block/icons/icon_dApp_sm.png"));
  const txNftBlockIcon = useImage(require("../../assets/block/icons/icon_nft_sm.png"));
  const txSnBlockIcon = useImage(require("../../assets/block/icons/icon_sn_sm.png"));

  const getTxIcon = (chainId: number, typeId: number) => {
    switch (chainId) {
      case 0:
        switch (typeId) {
          case 0:
            return txTxBlockIcon;
          case 1:
            return txBlobBlockIcon;
          case 2:
            return txDappBlockIcon;
          case 3:
            return txNftBlockIcon;
          case 4:
            return txSnBlockIcon;
          default:
            return emptyTxImg;
        }
      case 1:
        switch (typeId) {
          case 0:
            return txTxBlockIcon;
          case 1:
            return txBlobBlockIcon;
          case 2:
            return txDappBlockIcon;
          case 3:
            return txNftBlockIcon;
          case 4:
            return txSnBlockIcon;
          default:
            return emptyTxImg;
        }
      default:
        return txTxBlockIcon;
    }
  }

  const txBlockImgBlue = useImage(require("../../assets/block/backgrounds/blockchain_block_blue.png"));
  const txBlockImgGreen = useImage(require("../../assets/block/backgrounds/blockchain_block_green.png"));
  const txBlockImgPink = useImage(require("../../assets/block/backgrounds/blockchain_block_pink.png"));
  const txBlockImgPurple = useImage(require("../../assets/block/backgrounds/blockchain_block_purple.png"));
  const txBlockImgYellow = useImage(require("../../assets/block/backgrounds/blockchain_block_yellow.png"));

  const getTxImg = (chainId: number, typeId: number) => {
    switch (chainId) {
      case 0:
        switch (typeId) {
          case 0:
            return txBlockImgGreen;
          case 1:
            return txBlockImgYellow;
          case 2:
            return txBlockImgBlue;
          case 3:
            return txBlockImgPink;
          case 4:
            return txBlockImgPurple;
          default:
            return emptyTxImg;
        }
      case 1:
        switch (typeId) {
          case 0:
            return txBlockImgBlue;
          case 1:
            return txBlockImgGreen;
          case 2:
            return txBlockImgPink;
          case 3:
            return txBlockImgPurple;
          case 4:
            return txBlockImgYellow;
          default:
            return emptyTxImg;
        }
      default:
        return emptyTxImg;
    }
  }

  return (
    <View className="w-full h-full flex flex-col items-center justify-center relative">
      <View className="flex-1 bg-[#10111908] aspect-square relative">
        <View className="flex flex-wrap w-full aspect-square">
          <View className="absolute top-0 left-0 w-full h-full flex flex-wrap w-full aspect-square overflow-hidden">
            {props.block?.blockId !== 0 && Array.from({ length: maxBlockSize || 0 }, (_, index) => (
              <View
                key={index}
                style={{ width: `${txWidth}%`, height: `${txWidth}%` }}
              >
                <Canvas style={{ flex: 1 }} className="w-full h-full">
                  <SkiaImg
                    image={emptyTxImg}
                    fit="cover"
                    sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                    x={0}
                    y={0}
                    width={txWidth*3.4}
                    height={txWidth*3.4}
                  />
                </Canvas>
              </View>
            ))}
          </View>
          {props.block?.transactions.map((tx, index) => (
            index !== (props.block?.transactions.length || 1) - 1 && (
              <View
                key={index}
                className="relative"
                style={{ width: `${txWidth}%`, height: `${txWidth}%` }}
              >
                <Canvas style={{ flex: 1 }} className="w-full h-full">
                  <SkiaImg
                    image={getTxImg(props.chainId, tx.typeId)}
                    fit="cover"
                    sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                    x={0}
                    y={0}
                    width={txWidth*3.4}
                    height={txWidth*3.4}
                  />
                </Canvas>
                <View
                  className="absolute top-0 left-0"
                >
                  <Canvas style={{ flex: 1 }} className="">
                    <SkiaImg
                      image={getTxIcon(props.chainId, tx.typeId)}
                      fit="contain"
                      sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                      x={txWidth*(3.4-1.4)/2}
                      y={txWidth*(3.4-1.4)/2}
                      width={txWidth*1.4}
                      height={txWidth*1.4}
                    />
                  </Canvas>
                </View>
              </View>
            )
          ))}
          {props.block?.transactions.length !== 0 && (
            <View className="relative" style={{ width: `${txWidth}%`, height: `${txWidth}%` }}>
              <Animated.View
                className="absolute bottom-[-380%] left-0 w-full h-[400%] rounded-b-lg"
                style={[animatedObjectStyle]}
              >
                <View
                  className="w-full h-full rounded-b-lg"
                  style={[{
                  backgroundImage: `
                    linear-gradient(
                      to bottom,
                      #ffffff20,
                      #FFFFFFc0,
                      50%,
                    )`,
                  opacity: 0.5,
                }]}/>
              </Animated.View>
              <Animated.View
                style={[animatedObjectStyle, { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }]}
              >
                <Canvas style={{ flex: 1 }} className="w-full h-full">
                  <SkiaImg
                    image={getTxImg(props.chainId, props.block?.transactions[props.block?.transactions.length - 1].typeId || 0)}
                    fit="cover"
                    sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                    x={0}
                    y={0}
                    width={txWidth*3.4}
                    height={txWidth*3.4}
                  />
                </Canvas>
              </Animated.View>
            </View>
          )}
        </View>
        {props.block?.blockId === 0 && (
          <View className="absolute top-0 left-0 w-full h-full flex flex-col items-center"
                ref={ref}
                onLayout={onLayout}
                >
            {!props.completed && (
              <Text className="text-[#101119ff] text-4xl font-bold underline text-center pt-2 font-Xerxes">
                Genesis Block
              </Text>
            )}
            <Text
              className={`text-[#101119ff] font-bold text-center font-Pixels mt-[0.5rem] ${props.completed ? "text-sm" : "text-2xl"}`}
            >
              {props.chainId === 0 ? messagesJson.genesis.L1[currentPrestige] : messagesJson.genesis.L2[currentPrestige]}
            </Text>
          </View>
        )}
        {props.completed && (
          <View
            className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-between bg-[#171717c0] rounded-xl"
          >
            <Text className="text-[#e9e980f0] text-3xl font-bold m-1">
              #{props.block?.blockId}
            </Text>
            <View className="flex flex-col items-end justify-center w-full px-2">
              <View className="flex flex-row items-center gap-1">
                <Image
                  source={feeImg}
                  className="w-4 h-4"
                />
                <Text className="text-[#e9e980f0] text-lg font-bold">
                  {shortMoneyString((props.block?.fees || 0) + (props.block?.reward || 0))}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default BlockView;
