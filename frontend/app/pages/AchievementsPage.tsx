import React, { useEffect } from "react";
import {
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAchievement } from "../stores/useAchievementsStore";
import { useImageProvider } from "../context/ImageProvider";
import achievementJson from "../configs/achievements.json";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";

export const AchievementsPage: React.FC = () => {
  const { achievementsProgress } = useAchievement();
  const { width, height } = Dimensions.get("window");
  const { getImage } = useImageProvider();

  const [categories, setCategories] = React.useState<{ [key: string]: any[] }>(
    {},
  );
  useEffect(() => {
    const cats = achievementJson.reduce(
      (acc, achievement) => {
        const category = achievement.category || "General";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(achievement);
        return acc;
      },
      {} as { [key: string]: any[] },
    );
    setCategories(cats);
  }, []);

  return (
    <View className="flex-1 relative">
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("achievements.bg")}
            fit="fill"
            x={0}
            y={-62}
            width={width}
            height={height - 170}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      <View className="w-full relative h-[24px] mb-[10px]">
        <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
          <Image
            image={getImage("shop.title")}
            fit="fill"
            x={0}
            y={0}
            width={width - 8}
            height={24}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <Text className="text-[#fff7ff] text-xl absolute right-2 font-Pixels">
          ACHIEVEMENTS
        </Text>
      </View>
      <ScrollView
        className="flex-1 relative"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {Object.entries(categories).map(([category, achievements], index) => (
          <View key={index} className="w-full">
            <View
              className="relative mx-[16px] my-[8px] z-[10]"
              style={{ width: width - 32, height: 24 }}
            >
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <Image
                  image={getImage(`achievements.title`)}
                  fit="fill"
                  x={0}
                  y={0}
                  width={width - 32}
                  height={24}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                />
              </Canvas>
              <Text className="absolute left-[8px] font-Pixels text-xl text-[#fff7ff]">
                {category}
              </Text>
            </View>
            <ScrollView
              className="flex flex-row mx-[12px]"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {achievements.map((achievement, index) => (
                <View
                  className="relative flex flex-col w-[117px] h-[158px] mx-[4px]"
                  key={index}
                >
                  <Canvas style={{ flex: 1 }} className="w-full h-full">
                    <Image
                      image={getImage("achievements.tile.locked")}
                      fit="fill"
                      x={0}
                      y={0}
                      width={117}
                      height={158}
                    />
                  </Canvas>
                  {achievementsProgress[achievement.id] > 0 && (
                    <View
                      className="absolute top-0 left-0 h-full"
                      style={{
                        backgroundColor: "#6dcd64",
                        width: `${achievementsProgress[achievement.id]}%`,
                      }}
                    />
                  )}
                  {achievementsProgress[achievement.id] > 0 && (
                    <View className="absolute top-0 left-0 w-[117px] h-[158px]">
                      <Canvas style={{ flex: 1 }} className="w-full h-full">
                        <Image
                          image={getImage(
                            achievementsProgress[achievement.id] === 100
                              ? "achievements.tile.achieved"
                              : "achievements.tile.overlay",
                          )}
                          fit="fill"
                          x={0}
                          y={0}
                          width={117}
                          height={158}
                        />
                      </Canvas>
                    </View>
                  )}
                  <Text
                    className="font-Pixels text-[#fff7ff] text-[16px] leading-none
                      absolute top-[12px] w-full text-center px-[4px]"
                  >
                    {achievement.name}
                  </Text>
                  <View className="absolute bottom-[38px] left-[33px] w-[50px] h-[50px]">
                    <Canvas style={{ flex: 1 }} className="w-full h-full">
                      <Image
                        image={getImage(achievement.image)}
                        fit="fill"
                        x={0}
                        y={0}
                        width={50}
                        height={50}
                        sampling={{
                          filter: FilterMode.Nearest,
                          mipmap: MipmapMode.Nearest,
                        }}
                      />
                    </Canvas>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
        <View className="h-[40px]" />
        <LinearGradient
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 120,
            height: "100%",
            marginRight: 8,
            pointerEvents: "none",
          }}
          colors={["transparent", "#000000c0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </ScrollView>
      <View className="h-[100px]" />
    </View>
  );
};

export default AchievementsPage;
