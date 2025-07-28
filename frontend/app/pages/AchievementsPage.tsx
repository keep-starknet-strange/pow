import React, { useEffect } from "react";
import {
  View,
  Dimensions,
  Text,
  ScrollView,
} from "react-native";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import { useIsFocused } from '@react-navigation/native';
import { useAchievement } from "../stores/useAchievementsStore";
import { useImages } from "../hooks/useImages";
import achievementJson from "../configs/achievements.json";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";

export const AchievementsPage: React.FC = () => {
  const isFocused = useIsFocused();
  const { achievementsProgress } = useAchievement();
  const { width, height } = Dimensions.get("window");
  const { getImage } = useImages();

  const [categories, setCategories] = React.useState<{ [key: string]: any[] }>(
    {},
  );
  useEffect(() => {
    if (!isFocused) return;
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
  }, [isFocused]);

  if (!isFocused) {
    return <View className="flex-1 bg-[#101119]"></View>; // Return empty view if not focused
  }

  console.log("Rendering AchievementsPage with categories:", categories);
  return (
    <View className="flex-1 relative bg-[#101119ff]">
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("achievements.bg")}
            fit="fill"
            x={0}
            y={-55}
            width={width}
            height={650}
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
        <Animated.Text
          className="text-[#fff7ff] text-xl absolute right-2 font-Pixels"
          entering={FadeInLeft}
        >
          ACHIEVEMENTS
        </Animated.Text>
      </View>
      <View style={{ height: 558 }}>
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
                <Animated.Text
                  className="absolute left-[8px] font-Pixels text-xl text-[#fff7ff]"
                  entering={FadeInRight}
                >
                  {category}
                </Animated.Text>
              </View>
              <ScrollView
                className="flex flex-row mx-[12px]"
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {achievements.map((achievement, index) => (
                  <Animated.View
                    className="relative flex flex-col w-[117px] h-[158px] mx-[4px]"
                    key={index}
                    entering={FadeInRight}
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
                          fit="contain"
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
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          ))}
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
      </View>
    </View>
  );
};

export default AchievementsPage;
