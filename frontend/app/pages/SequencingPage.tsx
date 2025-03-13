import { useState, useEffect } from "react";
import { View } from "react-native";

import { BlockView } from "../components/BlockView";
import { Mempool } from "../components/Mempool";
import { Block } from "../types/Block";
import { newTransaction } from "../types/Transaction";

export type SequencingPageProps = {
  block: Block;
  setBlock: (block: Block) => void;
  switchPage: (page: string) => void;
};

export const SequencingPage: React.FC<SequencingPageProps> = (props) => {
  const [lastBlock, setLastBlock] = useState<Block | null>(null);
  useEffect(() => {
    if (props.block.id > 0) {
      setLastBlock({
        id: props.block.id - 1,
        reward: 0,
        fees: 0,
        transactions: Array.from({ length: 8*8 }, (_) => (newTransaction()))
      });
    }
  }, [props.block]);

  return (
    <View className="flex-1 relative">
      {lastBlock && (
        <View className="absolute top-0 left-[-50%] w-full">
          <BlockView block={lastBlock} hideStats={true} />
          <View className="absolute top-[50%] right-0 transform translate-x-[-88%] translate-y-[-50%] w-[18%] h-[1rem] bg-[#ffffff80] rounded-xl" />
        </View>
      )}
      <BlockView {...props} />
      <Mempool {...props} />
   </View>
  );
}

export default SequencingPage;
