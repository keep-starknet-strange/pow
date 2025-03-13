import { Text, View, TouchableOpacity } from 'react-native';

export type HeaderProps = {
  balance: number;
  tabs: {name: string, icon: string}[];
  switchPage: (page: string) => void;
};

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <View className="flex flex-row justify-between w-full p-4">
      <Text className="text-[#f7f7f7] text-2xl">Balance {props.balance.toFixed(4)} BTC</Text>
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
