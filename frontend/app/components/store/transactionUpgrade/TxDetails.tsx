import { View, Text } from "react-native";

type TxDetailsProps = {
  name: string;
  description: string;
};

export const TxDetails: React.FC<TxDetailsProps> = ({ name, description }) => (
  <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
    <Text className="text-[#e7e7e7] text-xl font-bold">{name}</Text>
    <Text className="text-[#e7e7e7] text-md">{description}</Text>
  </View>
);
