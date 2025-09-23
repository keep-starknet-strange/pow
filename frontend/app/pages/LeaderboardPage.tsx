import { memo, useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { PFPView } from "../components/PFPView";
import { useStarknetConnector } from "../context/StarknetConnector";
import { useBalance } from "../stores/useBalanceStore";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useFocEngine } from "../context/FocEngineConnector";
import { useImages } from "../hooks/useImages";
import { usePowContractConnector } from "../context/PowContractConnector";
import { shortMoneyString } from "../utils/helpers";
import {
  getRandomNounsAttributes,
  createNounsAttributes,
} from "../configs/nouns";
import { useIsFocused } from "@react-navigation/native";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
import { FOC_ENGINE_API } from "../context/FocEngineConnector";
import { useMock } from "../api/requests";
import {
  useLeaderboardInfiniteQuery,
  LeaderboardUser,
} from "../hooks/useLeaderboardQueries";

export const getPrestigeIcon = (prestige: number) => {
  if (prestige === 0) {
    return `shop.lock`;
  }
  return `prestige.${prestige}`;
};
/*
  const images = Object.values(prestigeImages);
  return images[prestige] || images[0];
};
*/

export const LeaderboardPage: React.FC = () => {
  const { STARKNET_ENABLED } = useStarknetConnector();
  const { getImage } = useImages();
  const { width, height } = useCachedWindowDimensions();
  const { powGameContractAddress } = usePowContractConnector();
  const isFocused = useIsFocused();

  // Use TanStack Query for leaderboard data
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLeaderboardInfiniteQuery();

  // Flatten all pages into a single array
  const leaderboard = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.users);
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Error message for display
  const errorMessage = useMemo(() => {
    if (isError) {
      return (
        (error as Error)?.message ||
        "Failed to load leaderboard. Please try again later."
      );
    }
    if (!STARKNET_ENABLED && !useMock) {
      return "Unable to connect to blockchain";
    }
    return null;
  }, [isError, error, STARKNET_ENABLED]);

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
            y={-26}
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
          LEADERBOARD
        </Animated.Text>
      </View>
      <View className="flex flex-row justify-between items-center px-4 bg-[#101119] mb-[4px]">
        <Animated.Text
          className="text-base text-white flex-1 font-Pixels"
          entering={FadeInLeft}
        >
          Leaderboard
        </Animated.Text>
        <Animated.Text
          className="text-base text-white w-[6rem] text-right font-Pixels"
          entering={FadeInRight}
        >
          Score
        </Animated.Text>
        <View className="w-[1rem]" />
        <Animated.Text
          className="text-base text-white w-[4.5rem] text-right font-Pixels"
          entering={FadeInRight}
        >
          Prestige
        </Animated.Text>
      </View>
      {isLoading && leaderboard.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff7ff" />
          <Animated.Text
            className="text-white text-lg font-Pixels mt-4"
            entering={FadeIn}
          >
            Loading leaderboard...
          </Animated.Text>
        </View>
      ) : errorMessage ? (
        <View className="flex-1 items-center justify-center px-8">
          <Animated.Text
            className="text-[#8B0000] text-lg font-Pixels text-center"
            entering={FadeIn}
          >
            {errorMessage}
          </Animated.Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <LeaderboardItem index={index} user={item} />
          )}
          ListFooterComponent={() =>
            hasNextPage ? (
              <View className="items-center mb-4 mt-2">
                <TouchableOpacity
                  onPress={handleLoadMore}
                  disabled={isFetchingNextPage}
                  style={{
                    width: 120,
                    height: 48,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {!isFetchingNextPage && (
                    <Canvas
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: 120,
                        height: 48,
                      }}
                    >
                      <Image
                        image={getImage("staking.button")}
                        x={0}
                        y={0}
                        width={120}
                        height={48}
                        fit="fill"
                        sampling={{
                          filter: FilterMode.Nearest,
                          mipmap: MipmapMode.Nearest,
                        }}
                      />
                    </Canvas>
                  )}
                  {isFetchingNextPage ? (
                    <ActivityIndicator size="small" color="#fff7ff" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: "Pixels",
                        fontSize: 16,
                        color: "#fff7ff",
                        textAlign: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                      }}
                    >
                      more...
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 200 }}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <LinearGradient
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          marginLeft: 8,
          marginRight: 8,
          marginBottom: 8,
          pointerEvents: "none",
        }}
        colors={["transparent", "#000000c0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <UserAccountSection />
    </View>
  );
};

const UserAccountSection: React.FC = memo(() => {
  const { getImage } = useImages();
  const { user } = useFocEngine();
  const { balance } = useBalance();
  const { currentPrestige } = useUpgrades();

  const userNouns = useMemo(() => {
    if (user?.account.metadata) {
      return createNounsAttributes(
        parseInt(user.account.metadata[0], 16),
        parseInt(user.account.metadata[1], 16),
        parseInt(user.account.metadata[2], 16),
        parseInt(user.account.metadata[3], 16),
      );
    }
    return getRandomNounsAttributes(user?.account_address);
  }, [user?.account.metadata]);

  const username = user?.account.username || "";

  if (!user) return null;

  return (
    <Animated.View
      className={`flex flex-row justify-between items-center px-4 py-2 z-10
        border-t-[5px] border-[#1b1c26] mx-[4px] bg-[#101119]
        `}
      entering={FadeInDown}
    >
      <View className="flex flex-row items-center flex-1">
        <View className="w-[60px] aspect-square mr-2 bg-[#11111160] relative p-[2px]">
          <PFPView user={user?.account_address} attributes={userNouns} />
        </View>
        <View className="flex-1 flex justify-center">
          <Text
            className="text-[28px] text-[#fff7ff] font-Teatime truncate"
            style={{ includeFontPadding: false }}
          >
            {username}
          </Text>
        </View>
      </View>
      <View className="w-[6rem] flex items-end justify-center">
        <Text
          className="text-xl text-white text-right font-Pixels"
          style={{ includeFontPadding: false }}
        >
          {shortMoneyString(balance)}
        </Text>
      </View>
      <View className="w-[1rem] flex items-center justify-end">
        <Canvas style={{ width: 16, height: 16, marginLeft: 2 }}>
          <Image
            image={getImage("shop.btc")}
            fit="contain"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={0}
            width={13}
            height={13}
          />
        </Canvas>
      </View>
      <View className="flex flex-row items-center justify-center w-[4.5rem]">
        <View className="w-[30px] aspect-square">
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getImage(getPrestigeIcon(currentPrestige))}
              fit="fill"
              x={0}
              y={0}
              width={30}
              height={30}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.None,
              }}
            />
          </Canvas>
        </View>
      </View>
    </Animated.View>
  );
});

export const LeaderboardItem: React.FC<{
  index: number;
  user: LeaderboardUser;
}> = memo(
  ({ index, user }: { index: number; user: LeaderboardUser }) => {
    const { getImage } = useImages();

    const getRankBadge = (index: number) => {
      switch (index) {
        case 0:
          return { badge: "leaderboard.number.gold", color: "#C61C01" };
        case 1:
          return { badge: "leaderboard.number.silver", color: "#252529" };
        case 2:
          return { badge: "leaderboard.number.bronze", color: "#672703" };
        default:
          return null;
      }
    };

    const rankInfo = getRankBadge(index);
    const rankNumber = index < 3 ? `0${index + 1}` : null;

    return (
      <View
        key={user.id}
        className={`flex flex-row justify-between items-center px-2 py-2 mx-[9px] ${
          index % 2 === 0 ? "transparent" : "bg-[#1b1c26]"
        }`}
      >
        <Animated.View
          className="flex flex-row items-center flex-1"
          entering={FadeInLeft}
        >
          {rankInfo && (
            <View className="w-[36px] h-[36px] mr-1 relative">
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <Image
                  image={getImage(rankInfo.badge)}
                  fit="contain"
                  x={0}
                  y={0}
                  width={36}
                  height={36}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                />
              </Canvas>
              <View className="absolute inset-0 items-center justify-center">
                <Text
                  className="text-[16px] font-Xerxes"
                  style={{
                    color: rankInfo.color,
                    includeFontPadding: false,
                    textAlign: "center",
                    lineHeight: 16,
                  }}
                >
                  {rankNumber}
                </Text>
              </View>
            </View>
          )}
          <View className="w-[60px] aspect-square mr-2 relative p-[2px]">
            <PFPView user={user.address} attributes={user.nouns} />
          </View>
          <View className="flex-1 flex justify-center">
            <Text
              className="text-[28px] text-[#fff7ff] font-Teatime truncate"
              style={{ includeFontPadding: false }}
            >
              {user.name}
            </Text>
          </View>
        </Animated.View>
        <Animated.View
          className="w-[6rem] flex items-end justify-center"
          entering={FadeInRight}
        >
          <Text
            className="text-xl text-white text-right font-Pixels"
            style={{ includeFontPadding: false }}
          >
            {shortMoneyString(user.balance)}
          </Text>
        </Animated.View>
        <View className="w-[1rem] flex items-center justify-end">
          <Canvas style={{ width: 16, height: 16, marginLeft: 2 }}>
            <Image
              image={getImage("shop.btc")}
              fit="contain"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              x={0}
              y={0}
              width={13}
              height={13}
            />
          </Canvas>
        </View>
        <Animated.View
          className="flex flex-row items-center justify-center w-[4.5rem]"
          entering={FadeInRight}
        >
          <View className="w-[30px] aspect-square">
            <Canvas style={{ flex: 1 }} className="w-full h-full">
              <Image
                image={getImage(getPrestigeIcon(user.prestige))}
                fit="contain"
                x={0}
                y={0}
                width={30}
                height={30}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.None,
                }}
              />
            </Canvas>
          </View>
        </Animated.View>
      </View>
    );
  },
  (prevProps: any, nextProps: any) => {
    // Prevent re-render if the user data hasn't changed
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.balance === nextProps.user.balance &&
      prevProps.user.prestige === nextProps.user.prestige &&
      prevProps.user.name === nextProps.user.name
    );
  },
);

export default LeaderboardPage;
