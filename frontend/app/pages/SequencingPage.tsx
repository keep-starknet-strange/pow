import { View } from "react-native";

import { BlockView } from "../components/BlockView";
import { Mempool } from "../components/Mempool";
import { Block } from "../types/Block";

export type SequencingPageProps = {
  lastBlock: Block | null;
  block: Block;
  setBlock: (block: Block) => void;
  switchPage: (page: string) => void;
};

export const SequencingPage: React.FC<SequencingPageProps> = (props) => {
  console.log("SequencingPage", props.block, props.lastBlock);
  return (
    <View className="flex-1 relative">
      {props.lastBlock !== null && (
        <View className="absolute top-0 left-[-50%] w-full">
          <BlockView block={props.lastBlock} hideStats={true} />
          <View className="absolute top-[50%] right-0 transform translate-x-[-88%] translate-y-[-50%] w-[18%] h-[1rem] bg-[#ffffff80] rounded-xl" />
        </View>
      )}
      <BlockView {...props} />
      <Mempool {...props} maxBlockTransactions={props.block.maxSize} />
   </View>
  );
}

export default SequencingPage;
