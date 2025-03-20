import { View } from "react-native";

import { BlockView } from "../components/BlockView";
import { Mempool } from "../components/Mempool";
import { useGameState } from "../context/GameState";

export type SequencingPageProps = {
  switchPage: (page: string) => void;
};

export const SequencingPage: React.FC<SequencingPageProps> = (props) => {
  const { gameState } = useGameState();
  return (
    <View className="flex-1 relative">
      {gameState.chains[0].lastBlock !== null && (
        <View className="absolute top-0 left-[-50%] w-full">
          <BlockView block={gameState.chains[0].lastBlock} hideStats={true} />
          <View className="absolute top-[50%] right-0 transform translate-x-[-88%] translate-y-[-50%] w-[18%] h-[1rem] bg-[#ffffff80] rounded-xl" />
        </View>
      )}
      <BlockView {...props} block={gameState.chains[0].currentBlock} />
      <Mempool {...props} />
   </View>
  );
}

export default SequencingPage;
