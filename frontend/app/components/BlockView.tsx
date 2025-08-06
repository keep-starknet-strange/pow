import { useCallback, useEffect, useState } from "react";
import { View, Text, Image, LayoutChangeEvent } from "react-native";
import Animated, { BounceIn, Easing, FadeOut } from "react-native-reanimated";
import messagesJson from "../configs/messages.json";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useImages } from "../hooks/useImages";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { TargetId } from "../stores/useTutorialStore";
import { Block } from "../types/Chains";
import { BlockTx } from "./BlockTx";
import { BlockTxOutlines } from "./BlockTxOutlines";

export type BlockViewProps = {
  chainId: number;
  block: Block | null;
  completed: boolean;
  showEmptyBlocks?: boolean;
  shouldExplodeTx?: boolean;
  shouldMiniExplode?: boolean;
};

export const BlockView: React.FC<BlockViewProps> = (props) => {
  const { getImage } = useImages();
  const { currentPrestige, getUpgradeValue } = useUpgrades();

  // The size of the whole block
  const [blockSize, setBlockSize] = useState<number>(0);
  // The size of each one of the transactions
  const [txSize, setTxSize] = useState<number>(0);

  const onBlockLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;

      setBlockSize(width);
    },
    [setBlockSize],
  );

  const txPerRow = props.block?.maxSize
    ? Math.sqrt(props.block.maxSize)
    : Math.sqrt(getUpgradeValue(props.chainId, "Block Size") ** 2);

  useEffect(() => {
    const txSize = blockSize / txPerRow - 0.001; // TODO check that with the team

    setTxSize(txSize);
  }, [blockSize, txPerRow]);

  return (
    <View className="w-full h-full flex flex-col items-center justify-center relative">
      <View className="flex-1 aspect-square relative shadow-md shadow-black/30">
        <View className="flex flex-wrap w-full aspect-square">
          <View
            className="absolute top-0 left-0 w-full h-full"
            onLayout={onBlockLayout}
          >
            {props.block?.blockId !== 0 && props.showEmptyBlocks && (
              <BlockTxOutlines txSize={txSize} txPerRow={txPerRow} />
            )}
          </View>
          {props.block?.transactions.map((tx, index) => (
            <BlockTx
              key={index}
              chainId={props.chainId}
              txTypeId={tx.typeId}
              isDapp={tx.isDapp || false}
              index={index}
              txSize={txSize}
              txPerRow={txPerRow}
              shouldExplode={props.shouldExplodeTx}
              explosionDelay={index * 50}
              shouldMiniExplode={props.shouldMiniExplode}
              miniExplosionDelay={index * 20}
            />
          ))}
        </View>
        {props.block?.blockId === 0 && (
          <View className="absolute top-0 left-0 w-full h-full flex flex-col items-center">
            <Text className="text-[#101119ff] text-4xl font-bold underline text-center pt-2 font-Xerxes">
              Genesis Block
            </Text>
            <Text
              className={`text-[#101119ff] text-center font-Pixels mt-[0.5rem] text-2xl`}
            >
              {props.chainId === 0
                ? messagesJson.genesis.L1[currentPrestige]
                : messagesJson.genesis.L2[currentPrestige]}
            </Text>
          </View>
        )}
        {props.completed && (
          <View className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center rounded-xl">
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
