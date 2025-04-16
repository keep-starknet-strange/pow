import { View, Text, TouchableOpacity } from 'react-native';
import { useGameState } from "../context/GameState";
import { BlockView } from "../components/BlockView";

export type StakingPageProps = {
  switchPage: (page: string) => void;
};

export const StakingPage: React.FC = (props) => {
  const { gameState } = useGameState();
  return (
    <View className="flex-1 bg-gray-900 px-4 py-6">
      <View className="flex flex-row justify-end items-center p-2">
        <Text className="text-[#e7e7e7] text-4xl font-bold mr-2">🥩Staking</Text>
      </View>
       {gameState.chains[0].pastBlocks && gameState.chains[0].pastBlocks.length > 0 && (
          <View className="flex flex-row w-full px-2 flex-row-reverse mt-6">
            {gameState.chains[0].pastBlocks.map((block, index) => (
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

        <TouchableOpacity
          // onPress={onPress}
          className="bg-gray-800 rounded-xl p-4 flex-row justify-between items-center"
        >
          <View className="flex-row items-center">
            🥩
            <Text className="text-white ml-2">$42 staked</Text>
          </View>
          <Text className="text-green-400">Claim $88</Text>
        </TouchableOpacity>
    </View>
  );
}