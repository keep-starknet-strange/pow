import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import messagesJson from "../configs/messages.json";
import { useUpgrades } from "../context/Upgrades";
import { useImageProvider } from "../context/ImageProvider";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { TargetId } from "../context/Tutorial";
import { Block } from "../types/Chains";
import { Canvas, Image as SkiaImg, FilterMode, MipmapMode } from '@shopify/react-native-skia';

export type BlockViewProps = {
  chainId: number;
  block: Block | null;
  completed: boolean;
};

export const BlockView: React.FC<BlockViewProps> = (props) => {
  const { getImage } = useImageProvider();
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
      transform: [{
        scale: 1- (yOffset.value / 600),
      }],
    };
  });

  const animate = () => {
    yOffset.value = withTiming(0, { duration: 300 });
  };

  useEffect(() => {
    yOffset.value = 600; // Start off-scren
    animate();
  }, [props.block?.transactions.length]);

  const maxBlockSize = getUpgradeValue(props.chainId, "Block Size") ** 2;

  const getTxIcon = (chainId: number, typeId: number) => {
    switch (chainId) {
      case 0:
        switch (typeId) {
          case 0:
            return getImage('block.icon.tx');
          case 1:
            return getImage('block.icon.tx');
          case 2:
            return getImage('block.icon.blob');
          case 3:
            return getImage('block.icon.nft');
          case 4:
            return getImage('block.icon.nft');
          default:
            return getImage('unknown');
        }
      case 1:
        switch (typeId) {
          case 0:
            return getImage('block.icon.tx');
          case 1:
            return getImage('block.icon.tx');
          case 2:
            return getImage('block.icon.blob');
          case 3:
            return getImage('block.icon.nft');
          case 4:
            return getImage('block.icon.nft');
          default:
            return getImage('unknown');
        }
      default:
        return getImage('unknown');
    }
  }

  const getTxImg = (chainId: number, typeId: number) => {
    switch (chainId) {
      case 0:
        switch (typeId) {
          case 0:
            return getImage('block.bg.green');
          case 1:
            return getImage('block.bg.yellow');
          case 2:
            return getImage('block.bg.blue');
          case 3:
            return getImage('block.bg.pink');
          case 4:
            return getImage('block.bg.purple');
          default:
            return getImage('unknown');
        }
      case 1:
        switch (typeId) {
          case 0:
            return getImage('block.bg.blue');
          case 1:
            return getImage('block.bg.green');
          case 2:
            return getImage('block.bg.pink');
          case 3:
            return getImage('block.bg.purple');
          case 4:
            return getImage('block.bg.yellow');
          default:
            return getImage('unknown');
        }
      default:
        return getImage('unknown');
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
                    image={getImage('block.bg.empty')}
                    fit="fill"
                    sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                    x={0}
                    y={0}
                    width={txWidth*3.3}
                    height={txWidth*3.3}
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
                    fit="fill"
                    sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                    x={0}
                    y={0}
                    width={txWidth*3.4}
                    height={txWidth*3.4}
                  />
                </Canvas>
                <View
                  className="absolute top-0 left-0 w-full h-full"
                >
                  <Canvas style={{ flex: 1 }} className="w-full h-full">
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
                    fit="fill"
                    sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                    x={0}
                    y={0}
                    width={txWidth*3.4}
                    height={txWidth*3.4}
                  />
                </Canvas>
                <View
                  className="absolute top-0 left-0 w-full h-full"
                >
                  <Canvas style={{ flex: 1 }} className="w-full h-full">
                    <SkiaImg
                      image={getTxIcon(props.chainId, props.block?.transactions[props.block?.transactions.length - 1].typeId || 0)}
                      fit="contain"
                      sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                      x={txWidth*(3.4-1.4)/2}
                      y={txWidth*(3.4-1.4)/2}
                      width={txWidth*1.4}
                      height={txWidth*1.4}
                    />
                  </Canvas>
                </View>
              </Animated.View>
            </View>
          )}
        </View>
        {props.block?.blockId === 0 && (
          <View className="absolute top-0 left-0 w-full h-full flex flex-col items-center"
                ref={ref}
                onLayout={onLayout}
                >
            <Text className="text-[#101119ff] text-4xl font-bold underline text-center pt-2 font-Xerxes">
              Genesis Block
            </Text>
            <Text
              className={`text-[#101119ff] font-bold text-center font-Pixels mt-[0.5rem] text-2xl`}
            >
              {props.chainId === 0 ? messagesJson.genesis.L1[currentPrestige] : messagesJson.genesis.L2[currentPrestige]}
            </Text>
          </View>
        )}
        {props.completed && (
          <View
            className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-[#17171770] rounded-xl"
          >
            <Text className="text-[#fff7ff] text-3xl font-bold font-Xerxes">
              Block {props.block?.blockId}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default BlockView;
