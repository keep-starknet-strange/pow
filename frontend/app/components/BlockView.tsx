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

  return (
    <View className="w-full h-full flex flex-col items-center justify-center">
      <View className="flex-1 bg-[#ffff8008] aspect-square rounded-xl border-2 border-[#ffff80b0] relative overflow-hidden">
        <View className="flex flex-wrap w-full aspect-square rounded-xl overflow-hidden">
          {props.block?.transactions.map((tx, index) => (
            index !== (props.block?.transactions.length || 1) - 1 && (
              <View
                key={index}
                className="border-2 border-[#ffffff20] rounded-lg overflow-hidden"
                style={{ width: `${txWidth}%`, height: `${txWidth}%`, ...getTxStyle(props.chainId, tx.typeId) }}
              >
                <Image className="w-full h-full flex flex-col items-center justify-center rounded-lg" source={tx.icon} />
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
                className="border-2 border-[#ffffff20] rounded-lg overflow-hidden"
                style={[animatedObjectStyle, {
                  ...getTxStyle(props.chainId, props.block?.transactions[props.block?.transactions.length - 1].typeId || 0),
                }]}
              >
                <Image className="w-full h-full flex flex-col items-center justify-center rounded-lg" source={props.block?.transactions[props.block?.transactions.length - 1].icon} />
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
              <Text className="text-[#ffff80ff] text-xl font-bold underline text-center pt-2">
                Genesis Block
              </Text>
            )}
            <Text
              className={`text-[#ffff80ff] font-bold text-center ${props.completed ? "text-sm" : "text-xl"}`}
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
                  ₿{((props.block?.fees || 0) + (props.block?.reward || 0)).toFixed(0)}
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
