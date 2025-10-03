import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
import {
  useAchievement,
  useAchievementsLastViewed,
  useIsAchievementUnseen,
} from "../stores/useAchievementsStore";
import { useImages } from "../hooks/useImages";
import achievementJson from "../configs/achievements.json";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";

// Constants to avoid magic numbers and improve readability
const ACHIEVEMENT_TILE_WIDTH = 117;
const ACHIEVEMENT_TILE_HEIGHT = 158;
const CATEGORY_HEADER_HEIGHT = 24;
const CATEGORY_MARGIN_HORIZONTAL = 16;
const CATEGORY_MARGIN_VERTICAL = 8;
const CATEGORY_TITLE_LEFT = 8;
const CATEGORY_TITLE_TOP = 3;
const SCREEN_BACKGROUND = "#101119ff";
const SCREEN_BACKGROUND_INACTIVE = "#101119";
const PIXEL_FONT = "Pixels";
const TEXT_PRIMARY = "#fff7ff";
const TITLE_RIGHT_MARGIN = 8; // Tailwind right-2
const ACHIEVEMENT_NAME_TOP = 8;
const ICON_CONTAINER_BOTTOM = 38;
const ICON_CONTAINER_LEFT = 33;
const ICON_SIZE = 50;
const TILE_HORIZONTAL_MARGIN = 4;
const GRADIENT_FRACTION = 0.14; // of screen width, clamped below

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor: SCREEN_BACKGROUND,
  },
  screenInactive: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND_INACTIVE,
  },
  absoluteFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  titleBar: {
    width: "100%",
    position: "relative",
    height: CATEGORY_HEADER_HEIGHT,
    marginBottom: 10,
  },
  titleText: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    position: "absolute",
    right: TITLE_RIGHT_MARGIN,
    fontFamily: PIXEL_FONT,
    transform: [{ translateY: 3 }],
  },
  categoryContainer: {
    width: "100%",
  },
  categoryHeaderWrapper: {
    position: "relative",
    marginHorizontal: CATEGORY_MARGIN_HORIZONTAL,
    marginVertical: CATEGORY_MARGIN_VERTICAL,
    zIndex: 10,
  },
  categoryHeaderText: {
    position: "absolute",
    left: CATEGORY_TITLE_LEFT,
    top: CATEGORY_TITLE_TOP,
    fontFamily: PIXEL_FONT,
    fontSize: 20,
    color: TEXT_PRIMARY,
  },
  categoryList: {
    marginHorizontal: 12,
    height: ACHIEVEMENT_TILE_HEIGHT,
  },
  achievementItem: {
    position: "relative",
    flexDirection: "column",
    width: ACHIEVEMENT_TILE_WIDTH,
    height: ACHIEVEMENT_TILE_HEIGHT,
    marginHorizontal: TILE_HORIZONTAL_MARGIN,
  },
  fillCanvas: {
    flex: 1,
  },
  progressOverlayBase: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
  },
  progressOverlayImageWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: ACHIEVEMENT_TILE_WIDTH,
    height: ACHIEVEMENT_TILE_HEIGHT,
  },
  achievementNameContainer: {
    position: "absolute",
    top: ACHIEVEMENT_NAME_TOP,
    left: 0,
    right: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  achievementNameText: {
    fontFamily: PIXEL_FONT,
    color: TEXT_PRIMARY,
    fontSize: 17,
    textAlign: "center",
    lineHeight: 16,
  },
  achievementIconContainer: {
    position: "absolute",
    bottom: ICON_CONTAINER_BOTTOM,
    left: ICON_CONTAINER_LEFT,
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  listArea: {
    flex: 1,
    position: "relative",
  },
  centerIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});

const AchievementItem: React.FC<{
  achievement: any;
  categoryId: string;
  achievementIndex: number;
  progress: number;
  getImage: (imageName: string) => any;
  renderAchievementName: (name: string) => React.ReactNode;
}> = ({
  achievement,
  categoryId,
  achievementIndex,
  progress,
  getImage,
  renderAchievementName,
}) => {
  const isUnseen = useIsAchievementUnseen(achievement.id);

  return (
    <Animated.View
      style={styles.achievementItem}
      key={achievementIndex}
      entering={FadeInRight}
    >
      <Canvas
        key={`achievement-bg-${categoryId}-${achievement.id}`}
        style={styles.fillCanvas}
      >
        <Image
          image={getImage("achievements.tile.locked")}
          fit="fill"
          x={0}
          y={0}
          width={ACHIEVEMENT_TILE_WIDTH}
          height={ACHIEVEMENT_TILE_HEIGHT}
        />
      </Canvas>
      {progress > 0 && (
        <View
          style={[
            styles.progressOverlayBase,
            {
              backgroundColor: "#6dcd64",
              width: `${progress}%`,
            },
          ]}
        />
      )}
      {progress > 0 && (
        <View style={styles.progressOverlayImageWrapper}>
          <Canvas
            key={`achievement-overlay-${categoryId}-${achievement.id}-${progress}`}
            style={styles.fillCanvas}
          >
            <Image
              image={getImage(
                progress === 100
                  ? "achievements.tile.achieved"
                  : "achievements.tile.overlay",
              )}
              fit="fill"
              x={0}
              y={0}
              width={ACHIEVEMENT_TILE_WIDTH}
              height={ACHIEVEMENT_TILE_HEIGHT}
            />
          </Canvas>
        </View>
      )}
      {progress === 100 && isUnseen && (
        <View
          style={{
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <View style={{ width: 62, height: 20 }}>
            <Canvas style={{ width: 62, height: 20 }}>
              <Image
                image={getImage("achievements.new.badge")}
                fit="contain"
                x={0}
                y={0}
                width={70}
                height={20}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Canvas>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#fff7ff",
                    fontSize: 15,
                    fontFamily: PIXEL_FONT,
                    fontWeight: "bold",
                    transform: [{ translateX: 5 }, { translateY: 1 }],
                  }}
                >
                  NEW!
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      <View style={styles.achievementNameContainer}>
        {renderAchievementName(achievement.name)}
      </View>
      <View style={styles.achievementIconContainer}>
        <Canvas
          key={`achievement-icon-${categoryId}-${achievement.id}`}
          style={styles.fillCanvas}
        >
          <Image
            image={getImage(achievement.image)}
            fit="contain"
            x={0}
            y={0}
            width={ICON_SIZE}
            height={ICON_SIZE}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
    </Animated.View>
  );
};

export const AchievementsPage: React.FC = () => {
  const isFocused = useIsFocused();
  const { achievementsProgress } = useAchievement();
  const { setAchievementsLastViewedNow } = useAchievementsLastViewed();
  const { width } = useCachedWindowDimensions();
  const { getImage } = useImages();

  useFocusEffect(
    useCallback(() => {
      // Mark achievements as viewed when the user leaves the page
      return () => {
        setAchievementsLastViewedNow();
      };
    }, [setAchievementsLastViewedNow]),
  );

  const renderAchievementName = useCallback(
    (name: string) => {
      // Split by BTC icon
      const parts = name.split(/(\{BTC\})/g).filter((part) => part.length > 0);

      return parts.map((part, partIndex) => {
        // Handle BTC icon
        if (part === "{BTC}") {
          return (
            <View key={partIndex} style={styles.centerIconWrapper}>
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
          <Text key={partIndex} style={styles.achievementNameText}>
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
      <View key={item.id} style={styles.categoryContainer}>
        <View
          style={[
            styles.categoryHeaderWrapper,
            {
              width: width - CATEGORY_MARGIN_HORIZONTAL * 2,
              height: CATEGORY_HEADER_HEIGHT,
            },
          ]}
        >
          <Canvas key={`category-header-${item.id}`} style={styles.fillCanvas}>
            <Image
              image={getImage(`achievements.title`)}
              fit="fill"
              x={0}
              y={0}
              width={width - CATEGORY_MARGIN_HORIZONTAL * 2}
              height={CATEGORY_HEADER_HEIGHT}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
          <Animated.Text
            style={styles.categoryHeaderText}
            entering={FadeInRight}
          >
            {item.category}
          </Animated.Text>
        </View>
        <FlatList
          data={item.achievements}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          keyExtractor={(achievement, achievementIndex) =>
            `${item.id}-${achievementIndex}`
          }
          removeClippedSubviews={false}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={10}
          renderItem={({ item: achievement, index: achievementIndex }) => (
            <AchievementItem
              achievement={achievement}
              categoryId={item.id}
              achievementIndex={achievementIndex}
              progress={achievementsProgress[achievement.id] || 0}
              getImage={getImage}
              renderAchievementName={renderAchievementName}
            />
          )}
        />
      </View>
    ),
    [width, getImage, achievementsProgress, renderAchievementName],
  );

  if (!isFocused) {
    return <View style={styles.screenInactive}></View>; // Return empty view if not focused
  }

  return (
    <View style={styles.screen}>
      <View style={styles.absoluteFill}>
        <Canvas style={{ flex: 1 }}>
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
      <View style={styles.titleBar}>
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
        <Animated.Text style={styles.titleText} entering={FadeInLeft}>
          ACHIEVEMENTS
        </Animated.Text>
      </View>
      <View style={{ flex: 1, height: 558 }}>
        <FlatList
          data={categoriesData}
          style={styles.listArea}
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
            width: Math.max(96, Math.min(140, width * GRADIENT_FRACTION)),
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
