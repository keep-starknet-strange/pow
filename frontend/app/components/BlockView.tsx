import { useEffect, useState, memo } from "react";
import { View, Text } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import messagesJson from "../configs/messages.json";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useImages } from "../hooks/useImages";
import { Block } from "../types/Chains";
import { BlockTx } from "./BlockTx";

export type BlockViewProps = {
  chainId: number;
  block: Block | null;
  width: number;
  height: number;
};

export const BlockView: React.FC<BlockViewProps> = (props) => {
  const { currentPrestige, getUpgradeValue } = useUpgrades();

  // The size of the whole block
  // The size of each one of the transactions
  const [txSize, setTxSize] = useState<number>(0);
  const txPerRow = props.block?.maxSize
    ? Math.sqrt(props.block.maxSize)
    : Math.sqrt(getUpgradeValue(props.chainId, "Block Size") ** 2);

  useEffect(() => {
    // Account for 4px inset on each side
    const insetWidth = props.width - 8;
    setTxSize(insetWidth / txPerRow);
  }, [props.width, txPerRow]);

  return (
    <View className="w-full h-full relative flex-1 aspect-square">
      {props.block?.isBuilt && (
        <BlockBorder width={props.width} height={props.height} />
      )}
      <View
        className="absolute"
        style={{ top: 4, left: 4, right: 4, bottom: 4 }}
      >
        {props.block?.transactions.map((tx, index) => (
          <BlockTx
            key={index}
            chainId={props.chainId}
            txTypeId={tx.typeId}
            isDapp={tx.isDapp || false}
            index={index}
            txSize={txSize}
            txPerRow={txPerRow}
          />
        ))}
      </View>
      {props.block?.blockId === 0 && (
        <View
          style={{
            width: props.width,
            height: props.height,
            flex: 1,
          }}
        >
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            className="text-[#101119ff] text-[32px] font-bold underline text-center font-Xerxes px-4 pt-2"
          >
            Genesis Block
          </Text>
          <Text
            style={{
              width: props.width,
              height: "100%",
              textAlign: "center",
            }}
            className={`flex text-[#101119ff] font-Pixels px-4 pt-2 text-[24px]`}
          >
            {props.chainId === 0
              ? messagesJson.genesis.L1[currentPrestige]
              : messagesJson.genesis.L2[currentPrestige]}
          </Text>
        </View>
      )}
    </View>
  );
};

export const BlockBorder: React.FC<{ width: number; height: number }> = memo(
  ({ width, height }) => {
    const { getImage } = useImages();

    return (
      <View className="absolute top-0 left-0">
        <Canvas style={{ width, height }}>
          <Image
            image={getImage("block.grid.min")}
            fit="fill"
            x={0}
            y={0}
            width={width}
            height={height}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
    );
  },
);

export default BlockView;
