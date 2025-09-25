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
  const { getAccounts } = useFocEngine();
  const { width, height } = useCachedWindowDimensions();
  const { powGameContractAddress, getUserPrestiges } =
    usePowContractConnector();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const leaderboardMock = [
    {
      id: 1,
      name: "Satoshi",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nouns: {
        head: 4,
        body: 2,
        glasses: 1,
        accessories: 3,
      },
      prestige: 10,
      balance: 1_245_000_000,
    },
    {
      id: 2,
      name: "Mr Moneybags",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nouns: {
        head: 5,
        body: 3,
        glasses: 2,
        accessories: 4,
      },
      prestige: 6,
      balance: 4_290_000,
    },
    {
      id: 3,
      name: "Builder",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nouns: {
        head: 3,
        body: 1,
        glasses: 0,
        accessories: 2,
      },
      prestige: 3,
      balance: 62_000,
    },
    {
      id: 4,
      name: "Hello World",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nouns: {
        head: 2,
        body: 0,
        glasses: 1,
        accessories: 1,
      },
      prestige: 1,
      balance: 1_000,
    },
    {
      id: 5,
      name: "Test User",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nouns: {
        head: 0,
        body: 0,
        glasses: 0,
        accessories: 0,
      },
      prestige: 0,
      balance: 200,
    },
    {
      id: 6,
      name: "Another User With Long Name",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nouns: {
        head: 1,
        body: 1,
        glasses: 1,
        accessories: 1,
      },
      prestige: 2,
      balance: 5_000,
    },
  ];
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageSize = 20;
  const isFocused = useIsFocused();

  const loadLeaderboardPage = useCallback(
    async (page: number, isInitialLoad: boolean = false) => {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const response = await fetch(
          `${FOC_ENGINE_API}/indexer/events-latest-ordered?order=desc&pageLength=${pageSize}&page=${page}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const events = data.events || [];

        if (events.length < pageSize) {
          setHasMorePages(false);
        }

        // Extract user addresses and balances from events
        const eventData = events.map((event: any) => ({
          user: event.keys[1], // User address from keys[1]
          balance: parseInt(event.data[1], 16), // Parse hex balance from data[1] as uint128
        }));

        const addresses = eventData.map((item: any) => item.user);
        const accounts = await getAccounts(addresses, undefined, true);

        // Fetch prestiges for all users
        const prestiges = await getUserPrestiges(addresses);

        const users = eventData.map((item: any, index: number) => {
          const shortAddress =
            item.user.slice(0, 4) + "..." + item.user.slice(-4);
          const account = accounts?.find(
            (account) => account.account_address === item.user,
          );
          const hasValidUsername =
            account?.account.username &&
            typeof account.account.username === "string" &&
            account.account.username.trim().length > 1;
          const name = hasValidUsername
            ? account.account.username
            : shortAddress;

          const baseId = page * pageSize + index + 1;
          return {
            address: item.user,
            balance: item.balance,
            prestige:
              prestiges && prestiges[index] !== undefined
                ? prestiges[index]
                : 0,
            nouns:
              account?.account.metadata && account.account.metadata.length === 4
                ? createNounsAttributes(
                    parseInt(account.account.metadata[0], 16),
                    parseInt(account.account.metadata[1], 16),
                    parseInt(account.account.metadata[2], 16),
                    parseInt(account.account.metadata[3], 16),
                  )
                : getRandomNounsAttributes(item.user),
            name,
            id: baseId,
          };
        });

        users.sort((a: any, b: any) => b.balance - a.balance);

        if (isInitialLoad) {
          setLeaderboard(users);
        } else {
          setLeaderboard((prev) => [...prev, ...users]);
        }

        setIsLoading(false);
        setIsLoadingMore(false);
        setError(null);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setError("Failed to load leaderboard. Please try again later.");
        if (isInitialLoad) {
          setLeaderboard([]);
        }
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [getAccounts, getUserPrestiges, pageSize],
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadLeaderboardPage(nextPage, false);
    }
  }, [currentPage, isLoadingMore, hasMorePages, loadLeaderboardPage]);

  useEffect(() => {
    if (!isFocused) {
      return; // Don't run if the page is not focused
    }

    // Reset state when page comes into focus
    setCurrentPage(0);
    setHasMorePages(true);
    setLeaderboard([]);

    // Use mock data if USE_MOCK is true
    if (useMock) {
      setLeaderboard(leaderboardMock);
      setIsLoading(false);
      setError(null);
      setHasMorePages(false);
      return;
    }

    if (!STARKNET_ENABLED || !powGameContractAddress) {
      // If Starknet is not enabled and not using mock, show error
      setError("Unable to connect to blockchain");
      setIsLoading(false);
      return;
    }

    loadLeaderboardPage(0, true);
  }, [
    STARKNET_ENABLED,
    powGameContractAddress,
    isFocused,
    loadLeaderboardPage,
  ]);

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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff7ff" />
          <Animated.Text
            className="text-white text-lg font-Pixels mt-4"
            entering={FadeIn}
          >
            Loading leaderboard...
          </Animated.Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Animated.Text
            className="text-[#8B0000] text-lg font-Pixels text-center"
            entering={FadeIn}
          >
            {error}
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
            hasMorePages ? (
              <View className="items-center mb-4 mt-2">
                <TouchableOpacity
                  onPress={handleLoadMore}
                  disabled={isLoadingMore}
                  style={{
                    width: 120,
                    height: 48,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {!isLoadingMore && (
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
                  {isLoadingMore ? (
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
  user: {
    id: number;
    name: string;
    address: string;
    nouns: {
      head: number;
      body: number;
      glasses: number;
      accessories: number;
    };
    prestige: number;
    balance: number;
  };
}> = memo(
  ({ index, user }: { index: number; user: any }) => {
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
