import { Text, View } from "react-native";

type BalanceProps = {
  balance: number;
};

const BalanceDisplay: React.FC<BalanceProps> = ({ balance }) => {
  return (
    <View className="flex flex-row justify-between w-full p-4">
      <Text className="text-[#f7f7f7] text-2xl">Balance {balance.toFixed(4)} BTC</Text>
      <View className="flex flex-row gap-4">
        {[...Array(3)].map((_, index) => (
          <View key={index} className="bg-[#f7f7f7] rounded-full w-[2rem] h-[2rem] flex items-center justify-center" />
        ))}
      </View>
    </View>
  );
};

export default BalanceDisplay;
