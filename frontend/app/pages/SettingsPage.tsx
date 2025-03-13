import { View, Text, TouchableOpacity } from "react-native";

export type SettingsPageProps = {
  closeHeaderTab: () => void;
};

export const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  return (
    <View className="flex-1">
     <Text className="text-xl text-white">Settings Page</Text>
     <TouchableOpacity
       className=""
       onPress={props.closeHeaderTab}
     >
       <Text className="text-red-600 text-4xl">X</Text>
     </TouchableOpacity>
   </View>
  );
}
