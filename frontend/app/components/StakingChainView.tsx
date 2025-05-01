import React from "react";
import { View } from "react-native";
import { useStaking } from "../context/Staking";
import { BlockView } from "./BlockView";

export type StakingChainViewProps = {
  chainId: number;
}

export const StakingChainView: React.FC<StakingChainViewProps> = (props) => {
  const { stakingChains } = useStaking();

  return (
    <View className="flex flex-row w-full justify-end pr-[0.5rem]">
      {stakingChains[props.chainId] && stakingChains[props.chainId].blocks.map((block, index) => (
        <View className="flex flex-row items-center" key={index}>
          <View className="h-[6rem] w-[6rem]">
            <BlockView chainId={props.chainId} block={block} completed={true} />
          </View>
          {index !== stakingChains[props.chainId].blocks.length - 1 && (
            <View className="flex flex-col items-center">
              <View className="w-2 h-[4px] mx-[2px] bg-[#f9f9f980] rounded-lg" />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
