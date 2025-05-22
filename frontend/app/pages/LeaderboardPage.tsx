import { useState, useEffect } from "react";
import { View, Text, ImageBackground, Image, TouchableOpacity, ScrollView } from "react-native";
import { SvgXml } from "react-native-svg";
import prestigeJson from "../configs/prestige.json";
import background from "../../assets/background.png";
import { shortMoneyString } from "../utils/helpers";

import * as prestigeImages from "../configs/prestige";
export const getPrestigeIcon = (prestige: number) => {
  const images = Object.values(prestigeImages);
  return images[prestige] || images[0];
}

export const LeaderboardPage: React.FC = () => {
  const leaderboardMock = [
    {
      id: 1,
      name: "Satoshi",
      prestige: 10,
      balance: 1_245_000_000,
    },
    {
      id: 2,
      name: "Mr Moneybags",
      prestige: 6,
      balance: 4_290_000,
    },
    {
      id: 3,
      name: "Builder",
      prestige: 3,
      balance: 62_000,
    },
    {
      id: 4,
      name: "Hello World",
      prestige: 1,
      balance: 1_000,
    },
    {
      id: 5,
      name: "Test User",
      prestige: 0,
      balance: 200,
    }
  ];
  const [leaderboard, setLeaderboard] = useState(leaderboardMock);

  const [userIconsSvgMap, setUserIconsSvgMap] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    const fetchUserIcons = async () => {
      const icons: { [key: string]: any } = {};
      for (const user of leaderboard) {
        const iconUri = `https://noun-api.com/beta/pfp?name=${user.name}`;
        const response = await fetch(iconUri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          icons[user.name] = atob(base64data.split(',')[1]);
        };
      }
      setUserIconsSvgMap(icons);
    };
    fetchUserIcons();
  }, []);

  return (
    <ImageBackground
      className="flex-1"
      source={background}
      resizeMode="cover"
    >
     <View className="flex flex-row justify-end items-center p-2">
       <Text className="text-[#e7e7e7] text-4xl font-bold mr-2">🏆Rankings</Text>
     </View>
     <View className="flex flex-row justify-between items-center p-4 transparent">
       <Text className="text-lg font-bold text-white flex-1">Leaderboard</Text>
       <Text className="text-lg font-bold text-white w-[6rem] text-center">Prestige</Text>
       <Text className="text-lg font-bold text-white w-[6rem] text-right">Score</Text>
     </View>
     <ScrollView className="flex-1">
       {leaderboard.map((user, index) => (
         <View key={user.id} className={`flex flex-row justify-between items-center p-4 ${index % 2 === 0 ? 'bg-[#ffff8010]' : 'bg-[#ffff8020]'}`}>
           <View className="flex flex-row items-center flex-1">
             {userIconsSvgMap[user.name] && (
               <View className="w-[3rem] aspect-square mr-2 rounded-full overflow-hidden">
                 <SvgXml xml={userIconsSvgMap[user.name]} width="100%" height="100%" />
               </View>
             )}
             <Text className="text-xl font-bold text-white">{user.name}</Text>
           </View>
           <View className="flex flex-row items-center justify-center w-[6rem]">
             <Image
               source={getPrestigeIcon(user.prestige)}
               className="w-[3rem] aspect-square rounded-full"
              />
            </View>
           <Text className="text-lg text-white w-[6rem] text-right font-bold">{shortMoneyString(user.balance)}</Text>
         </View>
       ))}
     </ScrollView>
   </ImageBackground>
  );
}

export default LeaderboardPage;
