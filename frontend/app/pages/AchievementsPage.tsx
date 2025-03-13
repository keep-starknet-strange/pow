import { View, Text, TouchableOpacity } from "react-native";

export type AchievementsPageProps = {
  closeHeaderTab: () => void;
};

export const AchievementsPage: React.FC<AchievementsPageProps> = (props) => {
  return (
    <View className="flex-1">
     <Text className="text-xl text-white">Achievements Page</Text>
     <TouchableOpacity
       className=""
       onPress={props.closeHeaderTab}
     >
       <Text className="text-red-600 text-4xl">X</Text>
     </TouchableOpacity>
   </View>
  );
}
