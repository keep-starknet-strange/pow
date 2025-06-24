import React from "react";
import { Text, View } from "react-native";
import { useGame } from "../context/Game";
import { useUpgrades } from "../context/Upgrades";
import { useImageProvider } from "../context/ImageProvider";
import { BlockView } from "./BlockView";
import { Miner } from "./Miner";
import { Sequencer } from "./Sequencer";
import { shortMoneyString } from "../utils/helpers";
import { Canvas, Image, FilterMode, MipmapMode } from '@shopify/react-native-skia';

export type WorkingBlockViewProps = {
  chainId: number;
}

export const WorkingBlockView: React.FC<WorkingBlockViewProps> = (props) => {
  const { workingBlocks, getWorkingBlock } = useGame();
  const { getUpgradeValue } = useUpgrades();
  const { getImage } = useImageProvider();

  return (
    <View className="flex flex-col items-center justify-center">
      <View className={`flex flex-row justify-center ${props.chainId === 0 ? "w-[346px] h-[408px]" : "w-[16rem]"}`}>
        <View className="absolute top-0 left-0 w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("block.grid")}
            fit="fill"
            x={0}
            y={0}
            width={144*2.4}
            height={170*2.4}
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
          />
        </Canvas>
        </View>
      
        <View className="z-[10] absolute top-[35px] left-[4px] w-[338px] h-[338px]">
          <BlockView chainId={props.chainId} block={getWorkingBlock(props.chainId)} completed={false} />
        </View>

        {workingBlocks[props.chainId]?.isBuilt && (
          <View className="z-[15] absolute top-[35px] left-[4px] w-[338px] h-[338px]">
            {props.chainId === 0 ? (
              <Miner />
            ) : (
              <Sequencer />
            )}
          </View>
        )}
        <Text className="text-[20px] font-bold text-[#c3c3c3] font-Pixels
                         absolute top-[8px] left-[10px]">
          Block {workingBlocks[props.chainId]?.blockId}
        </Text>
        <Text className="text-[20px] font-bold text-[#c3c3c3] font-Pixels
                         absolute bottom-[10px] left-[170px]">
           {workingBlocks[props.chainId]?.transactions.length}/{
             getUpgradeValue(props.chainId, "Block Size") ** 2
           }
        </Text>
        <Text className="text-[20px] font-bold text-[#fff7ff] font-Pixels
                         absolute bottom-[10px] left-[280px]">
          {shortMoneyString(
            workingBlocks[props.chainId]?.fees + 
            (workingBlocks[props.chainId]?.reward || getUpgradeValue(props.chainId, "Block Reward"))
          )}
        </Text>
      </View>
    </View>
  );
}

export default WorkingBlockView;
