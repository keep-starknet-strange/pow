import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export type LeaderboardPageProps = {
  closeHeaderTab: () => void;
};

export const LeaderboardPage: React.FC<LeaderboardPageProps> = (props) => {
  const leaderboardMock = [
    {
      id: 1,
      name: "Satoshi",
      prestige: 4,
      score: 1000,
    },
    {
      id: 2,
      name: "Mr Moneybags",
      prestige: 3,
      score: 800,
    },
    {
      id: 3,
      name: "Builder",
      prestige: 2,
      score: 600,
    },
    {
      id: 4,
      name: "Hello World",
      prestige: 1,
      score: 400,
    },
    {
      id: 5,
      name: "Test User",
      prestige: 0,
      score: 200,
    }
  ];
  const [leaderboard, setLeaderboard] = useState(leaderboardMock);

  const prestigeIcons = [
    "😢",  // 0
    "🙂",  // 1
    "😎",  // 2
    "🤩",  // 3
    "🥳"   // 4
  ];
  return (
    <View className="flex-1">
     <View className="flex flex-row justify-end items-center p-2">
       <Text className="text-[#e7e7e7] text-4xl font-bold mr-2">🏆Rankings</Text>
     </View>
     <View className="flex flex-row justify-between items-center p-4 bg-[#ffffff20]">
       <Text className="text-lg font-bold text-white">Leaderboard</Text>
       <View className="flex flex-row items-center justify-between w-[35%]">
         <Text className="text-lg font-bold text-white">Prestige</Text>
         <Text className="text-lg font-bold text-white">Score</Text>
       </View>
     </View>
     <ScrollView className="flex-1">
       {leaderboard.map((user, index) => (
         <View key={user.id} className={`flex flex-row justify-between items-center p-4 ${index % 2 === 0 ? 'bg-[#ffffff20]' : 'bg-[#ffffff10]'}`}>
           <Text className="text-lg font-bold text-white">{user.name}</Text>
           <View className="flex flex-row items-center justify-between w-[35%]">
             <Text className="text-white">{prestigeIcons[user.prestige]} {user.prestige}</Text>
             <Text className="text-white">{user.score}</Text>
           </View>
         </View>
       ))}
     </ScrollView>
   </View>
  );
}

export default LeaderboardPage;
