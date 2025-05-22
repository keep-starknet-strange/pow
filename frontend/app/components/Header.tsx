import { Text, View } from 'react-native';
import { useBalance } from "../context/Balance";
import { shortMoneyString } from "../utils/helpers";

export const Header: React.FC = () => {
  const { balance } = useBalance();
  return (
    <View className="absolute top-0 left-0 my-2 py-1 pr-2 bg-[#ffff8008] z-[100]
      border-2 border-l-0 border-[#ffff80b0] rounded-r-lg">
      <Text className="text-[#f7f780ff] text-2xl font-bold">💰{shortMoneyString(balance)}</Text>
    </View>
  );
};

export default Header;
