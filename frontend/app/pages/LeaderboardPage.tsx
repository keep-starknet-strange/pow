import { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { PFPView } from "../components/PFPView";
import prestigeJson from "../configs/prestige.json";
import { useStarknetConnector } from "../context/StarknetConnector";
import { useFocEngine } from "../context/FocEngineConnector";
import { usePowContractConnector } from "../context/PowContractConnector";
import background from "../../assets/background.png";
import { shortMoneyString } from "../utils/helpers";
import { getRandomNounsAttributes } from "../configs/nouns";

import * as prestigeImages from "../configs/prestige";
export const getPrestigeIcon = (prestige: number) => {
  const images = Object.values(prestigeImages);
  return images[prestige] || images[0];
};

export const LeaderboardPage: React.FC = () => {
  const { STARKNET_ENABLED } = useStarknetConnector();
  const { getAccounts, getUniqueEventsOrdered } = useFocEngine();
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
      const accounts = await getAccounts(addresses);
      // Example:
      //  {"accounts": [{"username": "qwdqwd", "address": "0x124"}, {"username": "hrthrth", "address": "0x125"}]}
      const users = scores.map((score: any, index: number) => {
        const shortAddress =
          score.user.slice(0, 6) + "..." + score.user.slice(-4);
        return {
          address: score.user,
          balance: score.new_balance,
          prestige: 0, // TODO
          nouns: getRandomNounsAttributes(), // TODO
          name:
            accounts?.accounts.find(
              (account: any) => account.address === score.user,
            )?.username || shortAddress,
          id: index + 1,
        };
      });
      users.sort((a: any, b: any) => b.balance - a.balance);
      setLeaderboard(users);
    };
    getLeaderboard();
  }, []);

  return (
    <ImageBackground className="flex-1" source={background} resizeMode="cover">
      <View className="flex flex-row justify-end items-center p-2">
        <Text className="text-[#e7e7e7] text-4xl font-bold mr-2 font-Xerxes">
          🏆 Rankings
        </Text>
      </View>
      <View className="flex flex-row justify-between items-center p-4 transparent">
        <Text className="text-lg font-bold text-white flex-1 font-Pixels">
          Leaderboard
        </Text>
        <Text className="text-lg font-bold text-white w-[5rem] text-center font-Pixels">
          Prestige
        </Text>
        <Text className="text-lg font-bold text-white w-[6rem] text-right font-Pixels">
          Score
        </Text>
      </View>
      <ScrollView className="flex-1">
        {leaderboard.map((user, index) => (
          <View
            key={user.id}
            className={`flex flex-row justify-between items-center p-2 ${index % 2 === 0 ? "bg-[#10111910]" : "bg-[#10111920]"}`}
          >
            <View className="flex flex-row items-center flex-1">
              <View
                className="w-[4rem] aspect-square mr-2 rounded-xl overflow-hidden bg-[#11111160]
                              border-2 border-[#e7e7e740] shadow-lg shadow-black/20
             "
              >
                <PFPView user={user.address} attributes={user.nouns} />
              </View>
              <Text className="text-2xl font-bold text-white font-Pixels">
                {user.name}
              </Text>
            </View>
            <View className="flex flex-row items-center justify-center w-[4rem]">
              <Image
                source={getPrestigeIcon(user.prestige)}
                className="w-[3rem] aspect-square rounded-full"
              />
            </View>
            <Text className="text-xl text-white w-[6rem] text-right font-bold font-Pixels">
              {shortMoneyString(user.balance)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

export default LeaderboardPage;
