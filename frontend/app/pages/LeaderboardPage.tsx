import { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
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
} from "react-native-reanimated";
import { PFPView } from "../components/PFPView";
import prestigeJson from "../configs/prestige.json";
import { useStarknetConnector } from "../context/StarknetConnector";
import { useBalance } from "../stores/useBalanceStore";
import { useUpgrades } from "../context/Upgrades";
import { useFocEngine } from "../context/FocEngineConnector";
import { useImages } from "../hooks/useImages";
import { usePowContractConnector } from "../context/PowContractConnector";
import background from "../../assets/background.png";
import { shortMoneyString } from "../utils/helpers";
import {
  getRandomNounsAttributes,
  createNounsAttributes,
} from "../configs/nouns";

import * as prestigeImages from "../configs/prestige";
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
  const { getAccounts, getUniqueEventsOrdered, user } = useFocEngine();
  const { width, height } = Dimensions.get("window");
  const { balance } = useBalance();
  const { currentPrestige } = useUpgrades();
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
  ];
  const [leaderboard, setLeaderboard] = useState(leaderboardMock);
  useEffect(() => {
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
  }, []);

  return (
    <View className="flex-1 relative">
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("background.shop")}
            fit="fill"
            x={0}
            y={-62}
            width={width}
            height={height}
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
          className="text-lg text-white flex-1 font-Pixels"
          entering={FadeInLeft}
        >
          Leaderboard
        </Animated.Text>
        <Animated.Text
          className="text-lg text-white w-[5rem] text-center font-Pixels"
          entering={FadeInRight}
        >
          Prestige
        </Animated.Text>
        <Animated.Text
          className="text-lg text-white w-[6rem] text-right font-Pixels"
          entering={FadeInRight}
        >
          Score
        </Animated.Text>
      </View>
      <ScrollView className="flex-1">
        {leaderboard.map((user, index) => (
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
              <View
                className="w-[4rem] aspect-square mr-2 rounded-xl overflow-hidden bg-[#11111160]
                              border-2 border-[#e7e7e740] shadow-lg shadow-black/20"
              >
                <PFPView user={user.address} attributes={user.nouns} />
              </View>
              <Text className="text-2xl text-white font-Pixels">
                {user.name}
              </Text>
            </Animated.View>
            <Animated.View
              className="flex flex-row items-center justify-center w-[4rem]"
              entering={FadeInRight}
            >
              <View className="w-[36px] aspect-square">
                <Canvas style={{ flex: 1 }} className="w-full h-full">
                  <Image
                    image={getImage(getPrestigeIcon(user.prestige))}
                    fit="fill"
                    x={0}
                    y={0}
                    width={36}
                    height={36}
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.None,
                    }}
                  />
                </Canvas>
              </View>
            </Animated.View>
            <Animated.Text
              className="text-xl text-white w-[6rem] text-right font-Pixels"
              entering={FadeInRight}
            >
              {shortMoneyString(user.balance)}
            </Animated.Text>
          </View>
        ))}
        <View className="h-[40px]" />
      </ScrollView>
      {user && (
        <Animated.View
          className={`flex flex-row justify-between items-center px-4 py-2 bg-[#101119] z-10
            border-t-[5px] border-[#1b1c26] shadow-lg shadow-black/20 mx-[4px]
            `}
          entering={FadeInDown}
        >
          <View className="flex flex-row items-center flex-1">
            <View
              className="w-[4rem] aspect-square mr-2 rounded-xl overflow-hidden bg-[#11111160]
                           border-2 border-[#e7e7e740] shadow-lg shadow-black/20"
            >
              <PFPView
                user={user?.account_address}
                attributes={
                  user.account.metadata
                    ? createNounsAttributes(
                        parseInt(user.account.metadata[0], 16),
                        parseInt(user.account.metadata[1], 16),
                        parseInt(user.account.metadata[2], 16),
                        parseInt(user.account.metadata[3], 16),
                      )
                    : getRandomNounsAttributes()
                }
              />
            </View>
            <Text className="text-2xl font-bold text-white font-Pixels">
              {user?.account.username}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-center w-[4rem]">
            <View className="w-[36px] aspect-square">
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <Image
                  image={getImage(getPrestigeIcon(currentPrestige))}
                  fit="fill"
                  x={0}
                  y={0}
                  width={36}
                  height={36}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.None,
                  }}
                />
              </Canvas>
            </View>
          </View>
          <Text className="text-xl text-white w-[6rem] text-right font-bold font-Pixels">
            {shortMoneyString(balance)}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default LeaderboardPage;
