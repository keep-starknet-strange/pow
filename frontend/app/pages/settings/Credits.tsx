import { View, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export const CreditsSection = () => {
  const creditedPeople = [
    { name: "ESTEVAN", role: "Team Lead" },
    { name: "BRANDON", role: "Design & Development" },
    { name: "ZACK", role: "Design & Development" },
    { name: "ALEX", role: "Development" },
    { name: "MICHAEL", role: "Development" },
    { name: "MORAN", role: "Design" },
    { name: "JON", role: "Art & Design" },
  ];
  const specialThanks = [
    { name: "SATOSHI NAKAMOTO", reason: "Creating a new era" },
    { name: "VITALIK BUTERIN", reason: "Creating the World Computer" },
    { name: "ELI BEN-SASSON", reason: "Creating STARK tech" },
  ];
  return (
    <Animated.View entering={FadeInUp}>
      <Text className="text-[#101119] text-[40px] font-Xerxes text-right">Credits</Text>
      <View className="mt-2">
        <Text className="text-[#101119] text-[22px] font-Teatime mb-6">
          created by StarkWare Exploration
        </Text>
        {creditedPeople.map((person, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between mb-2"
          >
            <Text
              className="text-[#101119] text-[24px] font-Teatime w-1/3"
            >
              {person.name}
            </Text>
            <Text
              className="text-[#101119] text-[16px] font-Pixels flex-1 text-left"
            >
              {person.role}
            </Text>
          </View>
        ))}
        <Text className="text-[#101119] text-[20px] font-Xerxes mt-6 mb-4 text-right">
          Special thanks
        </Text>
        {specialThanks.map((thanks, index) => (
          <View
            key={index}
            className="mb-4"
          >
            <Text
              className="text-[#101119] text-[24px] font-Teatime"
            >
              {thanks.name}
            </Text>
            <Text
              className="text-[#101119] text-[16px] font-Pixels ml-4"
            >
              {thanks.reason}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

export default CreditsSection;
