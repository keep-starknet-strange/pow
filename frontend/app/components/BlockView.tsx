import { View, Text, Image } from "react-native";
import { Block } from "../types/Block";
import { useCallback, useMemo } from "react";
import { useGameState } from "../context/GameState";
import {useUpgrades} from "../context/Upgrades"
import { useAutoCaller } from "../hooks/useAutoCaller"
import { newTransaction } from "../utils/transactions";


export type BlockViewProps = {
  block: Block;
  showOverlay?: boolean;
};

export const BlockView: React.FC<BlockViewProps> = (props) => {
    const { gameState, upgradableGameState, addTxToBlock } = useGameState();
    const { isUpgradeActive } = useUpgrades()

    const blockFull = useMemo(() => (
      gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize
    ), [gameState.chains]);
    const isCurrentBlock = useMemo(() => !props.showOverlay, [props.showOverlay]);
    
    const autoSequencerCallback = useCallback(() => {
      addTxToBlock(newTransaction(isUpgradeActive, upgradableGameState.mevScaling))
    }, [isUpgradeActive, upgradableGameState.mevScaling]);
  
    const sequencerActive = useMemo(() => (
      !!upgradableGameState.sequencerSpeed && !blockFull && isCurrentBlock
    ), [upgradableGameState.sequencerSpeed, blockFull, isCurrentBlock]);

    useAutoCaller(
      sequencerActive,
      1000 / upgradableGameState.sequencerSpeed,
      autoSequencerCallback
    );
  
  const txWidth: number = 100 / Math.sqrt(props.block.maxSize);
  // TODO: Overlay #s to constant size/length/digits
  return (
    <View className="w-full h-full flex flex-col items-center justify-center">
      <View className="flex-1 bg-[#f7f7f740] aspect-square rounded-xl border-2 border-[#f7f7f740] relative overflow-hidden">
        <View className="flex flex-wrap w-full aspect-square"> 
          {props.block.transactions.map((tx, index) => (
            <View
              key={index}
              className="w-[9.75%] aspect-square border-2 border-[#00000020] rounded-lg overflow-hidden"
              style={{ width: `${txWidth}%`, ...tx.style }}
            >
              {tx.image && (
                <Image className="w-full h-full flex flex-col items-center justify-center rounded-lg" source={ tx.image } />
              )}
            </View>
          ))}
        </View>
        {props.showOverlay ? (
          <View className="absolute top-0 left-0 w-full h-full bg-[#00000060] flex flex-col items-center justify-between">
            <View/>
            <Text className="text-[#e9e9e9f0] text-4xl font-bold m-1">#{props.block.id}</Text>
            <View className="flex flex-row items-center justify-between w-[95%]">
              <Text className="text-[#e9e9e9f0] text-xl font-bold">🔲₿{props.block.reward.toFixed(0)}</Text>
              <Text className="text-[#e9e9e9f0] text-xl font-bold">💰₿{props.block.fees.toFixed(0)}</Text>
            </View>
          </View>
        ) : (
          <View className="absolute bottom-0 w-full flex flex-row justify-end">
            <View className="bg-[#272727b0] rounded-tl-lg rounded-br-lg p-[4px]">
            <Text className="text-[#e9e9e9f0] text-xl font-bold">🔲 ₿{props.block.reward.toFixed(2)}</Text>
            <Text className="text-[#e9e9e9f0] text-xl font-bold">💰 ₿{props.block.fees.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default BlockView;
