import { Text, View, TouchableOpacity } from 'react-native';
import { useGameState } from "../context/GameState";

export type HeaderProps = {
  tabs: {name: string, icon: string}[];
  switchPage: (page: string) => void;
};

export const Header: React.FC<HeaderProps> = (props) => {
  const { gameState } = useGameState();
  return (
    <View className="absolute top-0 left-0 my-2 py-1 pr-2 bg-[#777777c0] z-[100]
      border-2 border-l-0 border-[#e7e7e780] rounded-r-lg">
      <Text className="text-[#f7f7f7] text-2xl font-bold">💰₿{gameState.balance.toFixed(2)}</Text>
    </View>
  );
};

export default Header;
