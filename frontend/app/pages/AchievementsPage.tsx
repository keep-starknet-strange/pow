import React, { useEffect, useMemo, useCallback } from "react";
import { View, Text, FlatList } from "react-native";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
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
  const { width, height } = useCachedWindowDimensions();
  const { getImage } = useImages();

  const renderAchievementName = useCallback(
    (name: string) => {
      // Split by BTC icon
      const parts = name.split(/(\{BTC\})/g).filter((part) => part.length > 0);

      return parts.map((part, partIndex) => {
        // Handle BTC icon
        if (part === "{BTC}") {
          return (
            <View
              key={partIndex}
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <Canvas
                style={{
                  width: 14,
                  height: 14,
                  marginLeft: 0,
                  marginRight: 1,
                }}
              >
                <Image
                  image={getImage("shop.btc")}
                  fit="contain"
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  x={0}
                  y={0}
                  width={14}
                  height={14}
                />
              </Canvas>
            </View>
          );
        }

        // Handle regular text
        return (
          <Text
            key={partIndex}
            className="font-Pixels text-[#fff7ff] text-[16px] leading-none text-center"
          >
            {part}
          </Text>
        );
      });
    },
    [getImage],
  );

  const categoriesData = useMemo(() => {
    if (!isFocused) return [];
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

    return Object.entries(cats).map(([category, achievements]) => ({
      category,
      achievements,
      id: category,
    }));
  }, [isFocused]);

  const renderCategoryItem = useCallback(
    ({
      item,
      index,
    }: {
      item: { category: string; achievements: any[]; id: string };
      index: number;
    }) => (
      <View key={item.id} className="w-full">
        <View
          className="relative mx-[16px] my-[8px] z-[10]"
          style={{ width: width - 32, height: 24 }}
        >
          <Canvas
            key={`category-header-${item.id}`}
            style={{ flex: 1 }}
            className="w-full h-full"
          >
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
            {item.category}
          </Animated.Text>
        </View>
        <FlatList
          data={item.achievements}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex mx-[12px]"
          keyExtractor={(achievement, achievementIndex) =>
            `${item.id}-${achievementIndex}`
          }
          removeClippedSubviews={false}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={10}
          renderItem={({ item: achievement, index: achievementIndex }) => (
            <Animated.View
              className="relative flex flex-col w-[117px] h-[158px] mx-[4px]"
              key={achievementIndex}
              entering={FadeInRight}
            >
              <Canvas
                key={`achievement-bg-${item.id}-${achievement.id}`}
                style={{ flex: 1 }}
                className="w-full h-full"
              >
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
                  <Canvas
                    key={`achievement-overlay-${item.id}-${achievement.id}-${achievementsProgress[achievement.id]}`}
                    style={{ flex: 1 }}
                    className="w-full h-full"
                  >
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
              <View className="absolute top-[8px] left-0 right-0 flex-row flex-wrap justify-center items-center">
                {renderAchievementName(achievement.name)}
              </View>
              <View className="absolute bottom-[38px] left-[33px] w-[50px] h-[50px]">
                <Canvas
                  key={`achievement-icon-${item.id}-${achievement.id}`}
                  style={{ flex: 1 }}
                  className="w-full h-full"
                >
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
          )}
        />
      </View>
    ),
    [width, getImage, achievementsProgress, renderAchievementName],
  );

  if (!isFocused) {
    return <View className="flex-1 bg-[#101119]"></View>; // Return empty view if not focused
  }

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
        <FlatList
          data={categoriesData}
          className="flex-1 relative"
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={12}
          removeClippedSubviews={false}
          getItemLayout={undefined}
        />
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
      </View>
    </View>
  );
};

export default AchievementsPage;
