import { View, Text, TouchableOpacity } from "react-native";

export type StorePageProps = {
  closeHeaderTab: () => void;
};

export const StorePage: React.FC<StorePageProps> = (props) => {
  return (
    <View className="flex-1">
     <Text className="text-xl text-white">Store Page</Text>
     <TouchableOpacity
       className=""
       onPress={props.closeHeaderTab}
     >
       <Text className="text-red-600 text-4xl">X</Text>
     </TouchableOpacity>
   </View>
  );
}
