import { memo, useState, useEffect, useMemo } from "react";
import { View, Text, FlatList } from "react-native";
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
  const { getAccounts, getUniqueEventsOrdered } = useFocEngine();
  const { width, height } = useCachedWindowDimensions();
  const { powGameContractAddress } = usePowContractConnector();
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
  const [leaderboard, setLeaderboard] = useState(leaderboardMock);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      return; // Don't run if the page is not focused
    }
    if (!STARKNET_ENABLED || !powGameContractAddress) {
      // If Starknet is not enabled, use mock data
      setLeaderboard(leaderboardMock);
      return;
    }
    const getLeaderboard = async () => {
      // Load the leaderboard data from an API
      const scores = await getUniqueEventsOrdered(
        powGameContractAddress,
        "pow_game::pow::PowGame::BalanceUpdated",
        "user",
        "new_balance",
        {},
      );
      // Example:
      // [{"_id": "685a4b70d117280deb4d8824", "block_number": 58, "contract_address": "0x3e5dafbf907aed77522fbea63e585b422ddb9f2d1d9f74343538112cfcdbe6f", "event_type": "pow_game::pow::PowGame::BalanceUpdated", "new_balance": 28, "old_balance": 30, "transaction_hash": "0x1460c94fbadb252a6040b896a0bccfc1cfe595b2aba65d3be9b5c93ecfb49e2", "user": "0x7aa5ab9786925f5532017166691e2218c794ea2d05828fed0b133aca5edb8d9"}, {"_id": "685a4af9d117280deb4d87d9", "block_number": 54, "contract_address": "0x3e5dafbf907aed77522fbea63e585b422ddb9f2d1d9f74343538112cfcdbe6f", "event_type": "pow_game::pow::PowGame::BalanceUpdated", "new_balance": 25, "old_balance": 28, "transaction_hash": "0x4159d10b3193b31a321613e45efef6e5b01d2037927dfd435312dd3715193c5", "user": "0x790e1ae5b373f63cc2b8ea4c98cb301a3543dcc062e98a33c0ad450e75e2ac4"}]
      const addresses = scores.map((score: any) => score.user);
      const accounts = await getAccounts(addresses, undefined, true);
      // Example:
      //  {"accounts": [{"username": "qwdqwd", "address": "0x124"}, {"username": "hrthrth", "address": "0x125"}]}
      const users = scores.map((score: any, index: number) => {
        const shortAddress =
          score.user.slice(0, 6) + "..." + score.user.slice(-4);
        const account = accounts?.find(
          (account) => account.account_address === score.user,
        );
        return {
          address: score.user,
          balance: score.new_balance,
          prestige: 0, // TODO
          nouns: account?.account.metadata
            ? createNounsAttributes(
                parseInt(account.account.metadata[0], 16),
                parseInt(account.account.metadata[1], 16),
                parseInt(account.account.metadata[2], 16),
                parseInt(account.account.metadata[3], 16),
              )
            : getRandomNounsAttributes(),
          name: account?.account.username || shortAddress,
          id: index + 1,
        };
      });
      users.sort((a: any, b: any) => b.balance - a.balance);
      setLeaderboard(users);
    };
    getLeaderboard();
  }, [
    STARKNET_ENABLED,
    powGameContractAddress,
    getAccounts,
    getUniqueEventsOrdered,
    isFocused,
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
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <LeaderboardItem index={index} user={item} />
        )}
        contentContainerStyle={{ paddingBottom: 200 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
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
    return getRandomNounsAttributes();
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
