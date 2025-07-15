import { View, Text, TouchableOpacity, Linking } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export const AboutSection = () => {
  return (
    <Animated.View entering={FadeInUp}>
      <Text className="text-[#101119] text-[40px] font-Xerxes text-right">About</Text>
      <Text className="text-[#101119] mt-4 text-[18px] font-Pixels">
        POW! is THE idle clicker game on Starknet, where players can
        experience the thrill of building their own blockchain empire through
        simple yet addictive click-to-earn mechanics.
      </Text>
      <View className="mt-8">
        <Text className="text-[#101119] text-[32px] font-Xerxes text-right">Features</Text>
        <View className="flex flex-col gap-2 mt-4">
          <Text className="text-[#101119] font-Pixels text-[18px]">
            ● Fully Onchain Experience
          </Text>
          <Text className="text-[#101119] font-Pixels text-[18px]">
            ● Enticing Click-to-Earn Gameplay
          </Text>
          <Text className="text-[#101119] font-Pixels text-[18px]">
            ● Session Keys & Paymaster
          </Text>
          <Text className="text-[#101119] font-Pixels text-[18px]">
            ● Open Source Goldmine
          </Text>
        </View>
      </View>
      <View className="mt-8">
        <Text className="text-[#101119] text-[32px] font-Xerxes text-right">Contact</Text>
        <View className="flex flex-row gap-4 mt-8 justify-around">
          <TouchableOpacity
            onPress={() => {
              const url = process.env.NEXT_PUBLIC_DISCORD_URL || "https://x.com/StarkWareLtd";
              Linking.openURL(url);
            }}
          >
            <Text className="text-[#101119] font-Pixels text-[18px]">
              <Text className="underline">Twitter</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const url = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/powgame";
              Linking.openURL(url);
            }}
          >
            <Text className="text-[#101119] font-Pixels text-[18px]">
              <Text className="underline">Telegram</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const url = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/keep-starknet-strange/pow";
              Linking.openURL(url);
            }}
          >
            <Text className="text-[#101119] font-Pixels text-[18px]">
              <Text className="underline">GitHub</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default AboutSection;
