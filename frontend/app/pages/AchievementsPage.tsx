import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useAchievement } from "../context/Achievements";
import { Achievement } from "../types/Achievement";

export type AchievementsPageProps = {
  closeTab: () => void;
};

export const AchievementsPage: React.FC<AchievementsPageProps> = (props) => {
  const { achievements } = useAchievement();
  return (
    <View className="flex-1">
     <View className="flex flex-row justify-end items-center p-2">
       <Text className="text-[#e7e7e7] text-4xl font-bold mr-2">🎉Achievements</Text>
     </View>
     <ScrollView className="flex-1">
       <View className="flex flex-row flex-wrap gap-4 justify-center mb-[3rem]">
         {achievements && Object.values(achievements).map((achievement: Achievement, index: number) => (
           <View className={`p-4 rounded-lg w-[40%]
             border-2 border-[#ffffff40] border-opacity-20
             flex flex-col items-center justify-center gap-2
             ${achievement.progress === 100 ? "bg-[#20ff2080]" : "bg-[#ffffff20]"}`}
             key={index}
           >
             <Text className="text-2xl text-white">{achievement.name}</Text>
             <Image className="w-24 h-24" source={{ uri: achievement.image }} />
             {achievement.progress === 100 ? (
               <Text className="text-white">Achieved!</Text>
              ) : (
               <View className="bg-[#ffffff40] w-full h-2 rounded-xl relative">
                 <View className="bg-[#20ff2080] h-full rounded-xl" style={{ width: `${achievement.progress}%` }} />
               </View>
             )}
           </View>
         ))}
       </View>
     </ScrollView>
   </View>
  );
}

export default AchievementsPage;
