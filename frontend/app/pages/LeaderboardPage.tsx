import { View, Text, TouchableOpacity } from "react-native";

export type LeaderboardPageProps = {
  closeHeaderTab: () => void;
};

export const LeaderboardPage: React.FC<LeaderboardPageProps> = (props) => {
  return (
    <View className="flex-1">
     <Text className="text-xl text-white">Leaderboard Page</Text>
     <TouchableOpacity
       className=""
       onPress={props.closeHeaderTab}
     >
       <Text className="text-red-600 text-4xl">X</Text>
     </TouchableOpacity>
   </View>
  );
}

export default LeaderboardPage;
