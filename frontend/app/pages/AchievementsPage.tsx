import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAchievement } from "../context/Achievements";
import achievementJson from "../configs/achievements.json";
import background from "../../assets/background.png";

export const AchievementsPage: React.FC = () => {
  const { achievementsProgress } = useAchievement();
  return (
    <ImageBackground className="flex-1" source={background} resizeMode="cover">
      <View className="flex flex-row justify-end items-center p-2">
        <Text className="text-[#e7e7e7] text-2xl font-bold mr-2">
          🎉Achievements
        </Text>
      </View>
      <ScrollView className="flex-1">
        <View className="flex flex-row flex-wrap gap-2 justify-center mb-[3rem] mr-[1rem]">
          {achievementJson.map((achievement, index) => (
            <View
              className={`p-2 rounded-lg w-[23%]
             border-2 border-[#ffffff40] border-opacity-20
             flex flex-col items-center justify-center gap-1
             ${achievementsProgress[achievement.id] === 100 ? "bg-[#20ff2080]" : "bg-[#ffffff20]"}`}
              key={index}
            >
              <Text className="text-lg text-white h-[4rem]">
                {achievement.name}
              </Text>
              <Image
                className="w-16 h-16"
                source={{ uri: achievement.image }}
              />
              {achievementsProgress[achievement.id] === 100 ? (
                <Text className="text-white">Achieved!</Text>
              ) : (
                <View className="bg-[#ffffff40] w-full h-2 rounded-xl relative">
                  <View
                    className="bg-[#20ff2080] h-full rounded-xl"
                    style={{
                      width: `${achievementsProgress[achievement.id]}%`,
                    }}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default AchievementsPage;
