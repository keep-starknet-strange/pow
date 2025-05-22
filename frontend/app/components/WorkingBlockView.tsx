import React from "react";
import { Text, View, Image } from "react-native";
import { useGame } from "../context/Game";
import { useUpgrades } from "../context/Upgrades";
import { BlockView } from "./BlockView";
import { Miner } from "./Miner";
import { Sequencer } from "./Sequencer";
import rewardImg from "../../assets/images/coin.png";
import feeImg from "../../assets/images/bitcoin.png";
import { shortMoneyString } from "../utils/helpers";

export type WorkingBlockViewProps = {
  chainId: number;
}

export const WorkingBlockView: React.FC<WorkingBlockViewProps> = (props) => {
  const { workingBlocks, getWorkingBlock } = useGame();
  const { getUpgradeValue } = useUpgrades();

  return (
    <View className="flex flex-col items-center justify-center">
      <View className={`flex flex-row justify-center aspect-square ${props.chainId === 0 ? "w-[22rem]" : "w-[16rem]"}`}>
        <BlockView chainId={props.chainId} block={getWorkingBlock(props.chainId)} completed={false} />
        {workingBlocks[props.chainId]?.isBuilt && (
          <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
            {props.chainId === 0 ? (
              <Miner />
            ) : (
              <Sequencer />
            )}
          </View>
        )}
      </View>

      <View
        className="flex flex-row justify-between items-center w-[22rem] mt-[0.5rem] px-2
                   bg-[#ffff8008] rounded-lg shadow-lg border-2 border-[#ffff80b0]"
      >
        <Text className="text-2xl font-bold text-[#f9f980d0]">
          Block {workingBlocks[props.chainId]?.blockId}
        </Text>
        <View className="flex flex-row items-center gap-4">
          <View className="flex flex-row items-center gap-1">
            <Image source={feeImg} className="w-6 h-6" />
            <Text className="text-xl font-bold text-[#f9f980d0]">
              {shortMoneyString(workingBlocks[props.chainId]?.fees)}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1">
            <Image source={rewardImg} className="w-6 h-6" />
            <Text className="text-xl font-bold text-[#f9f980d0]">
              {shortMoneyString(workingBlocks[props.chainId]?.reward || getUpgradeValue(props.chainId, "Block Reward"))}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default WorkingBlockView;
