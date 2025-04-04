import { useEffect } from "react";
import { Text, View } from "react-native";
import { BlockView } from "../components/BlockView";
import { Mempool } from "../components/Mempool";
import { Miner } from "../components/Miner";
import { useGameState } from "../context/GameState";
import { useCurrentBlock } from "../context/CurrentBlock";

export type MainPageProps = {
  switchPage: (page: string) => void;
};

export const MainPage: React.FC<MainPageProps> = (props) => {
  const { gameState } = useGameState();
  const { currentBlock } = useCurrentBlock();
  // TODO: Style overflow with shadow of pastBlocks
  // TODO: Disable mempool if block is full
  return (
    <View className="flex-1 relative flex flex-col items-center mt-10">

      <Text className="text-2xl font-bold text-[#f9f9f9] mt-[0.5rem]">
        Block #{currentBlock.id}
      </Text>

      <View className="flex flex-row justify-center w-full h-[22rem]">
        <BlockView {...props} block={currentBlock} />
        {currentBlock.transactions.length >= currentBlock.maxSize && (
          <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
            <Miner {...props} />
          </View>
        )}
      </View>

      <View className="mt-6">
        <Mempool {...props} />
      </View>

      {gameState.chains[0].blocks && gameState.chains[0].blocks.length > 0 && (
        <View className="flex flex-row w-full px-2 flex-row-reverse mt-6">
          {gameState.chains[0].blocks.map((block, index) => (
            <View className="flex flex-row items-center" key={index}>
              <View className="h-[8rem] w-[8rem]">
                <BlockView {...props} block={block} showOverlay={true} />
              </View>
              {index !== 0 && (
                <View className="flex flex-col items-center">
                  <View className="w-2 h-[4px] mx-[2px] bg-[#f9f9f980] rounded-lg" />
                </View>
              )}
            </View>
          ))}
        </View>
      )}
   </View>
  );
}

export default MainPage;
