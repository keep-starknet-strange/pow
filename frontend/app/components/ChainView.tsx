import React from "react";
import { View } from "react-native";
import { useChainsStore } from "../stores/useChainsStore";
import { BlockView } from "./BlockView";

export type ChainViewProps = {
  chainId: number;
};

export const ChainView: React.FC<ChainViewProps> = (props) => {
  const { chains } = useChainsStore();

  return (
    <View className="flex flex-row w-full justify-end pr-[0.5rem] min-h-[6rem]">
      {chains[props.chainId] &&
        chains[props.chainId].blocks.map((block, index) => (
          <View className="flex flex-row items-center" key={index}>
            <View className="h-[6rem] w-[6rem]">
              <BlockView
                chainId={props.chainId}
                block={block}
                completed={true}
              />
            </View>
            {index !== chains[props.chainId].blocks.length - 1 && (
              <View className="flex flex-col items-center">
                <View className="w-2 h-[4px] mx-[2px] bg-[#f9f9f980] rounded-lg" />
              </View>
            )}
          </View>
        ))}
    </View>
  );
};
