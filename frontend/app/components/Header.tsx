import { Text, View, TouchableOpacity } from 'react-native';
import { useGameState } from "../context/GameState";

export type HeaderProps = {
  tabs: {name: string, icon: string}[];
  switchPage: (page: string) => void;
};

export const Header: React.FC<HeaderProps> = (props) => {
  const { gameState } = useGameState();
  return (
    <View className="flex flex-row justify-between w-full p-4">
      <Text className="text-[#f7f7f7] text-2xl font-bold">💰₿ {gameState.balance.toFixed(4)}</Text>
      <View className="flex flex-row gap-3">
        {props.tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            className="flex flex-row"
            onPress={() => props.switchPage(tab.name)}
          >
            <Text className="text-[#f7f7f7] text-2xl">{tab.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Header;
