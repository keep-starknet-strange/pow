import React from "react";
import { Text, View } from "react-native";
import { useGame } from "../context/Game";
import { useUpgrades } from "../context/Upgrades";
import { useImageProvider } from "../context/ImageProvider";
import { BlockView } from "./BlockView";
import { Miner } from "./Miner";
import { Sequencer } from "./Sequencer";
import { Easing } from "react-native-reanimated";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export type WorkingBlockViewProps = {
  chainId: number;
};

export const WorkingBlockView: React.FC<WorkingBlockViewProps> = (props) => {
  const { workingBlocks, getWorkingBlock } = useGame();
  const { getUpgradeValue } = useUpgrades();
  const { getImage } = useImageProvider();

  return (
    <View className="flex flex-col items-center justify-center">
      <View className={"flex flex-row justify-center w-[346px] h-[408px]"}>
        <View className="absolute top-0 left-0 w-full h-full">
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getImage("block.grid")}
              fit="fill"
              x={0}
              y={0}
              width={144 * 2.4}
              height={170 * 2.4}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
        </View>

        <View className="z-[10] absolute top-[35px] left-[4px] w-[338px] h-[338px]">
          <BlockView
            chainId={props.chainId}
            block={getWorkingBlock(props.chainId)}
            completed={false}
          />
        </View>

        {workingBlocks[props.chainId]?.isBuilt && (
          <View className="z-[15] absolute top-[35px] left-[4px] w-[338px] h-[338px]">
            {props.chainId === 0 ? <Miner /> : <Sequencer />}
          </View>
        )}
        <Text
          className="text-[20px] text-[#c3c3c3] font-Pixels
                         absolute top-[8px] left-[10px]"
        >
          Block {workingBlocks[props.chainId]?.blockId}
        </Text>
        <View className="absolute bottom-[10px] left-[170px] flex flex-row">
          <AnimatedRollingNumber
            value={workingBlocks[props.chainId]?.transactions.length}
            textStyle={{ fontSize: 20, color: "#c3c3c3", fontFamily: "Pixels" }}
            spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
          />
          <Text className="text-[20px] text-[#c3c3c3] font-Pixels">
            /{getUpgradeValue(props.chainId, "Block Size") ** 2}
          </Text>
        </View>
        <View className="absolute bottom-[10px] left-[280px]">
          <AnimatedRollingNumber
            value={
              workingBlocks[props.chainId]?.fees +
              (workingBlocks[props.chainId]?.reward ||
                getUpgradeValue(props.chainId, "Block Reward"))
            }
            enableCompactNotation
            compactToFixed={1}
            textStyle={{
              fontSize: 20,
              color: "#fff2fdff",
              fontFamily: "Pixels",
            }}
            spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
          />
        </View>
      </View>
    </View>
  );
};

export default WorkingBlockView;
